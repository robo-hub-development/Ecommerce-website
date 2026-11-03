import { ENDPOINTS } from "@/lib/api/endpoints";
import { env } from "@/lib/env";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  query?: QueryParams;
  /**
   * The call needs the signed-in user. On the server the session token is read from the httpOnly
   * cookie and sent as a bearer token; in the browser the call goes through the BFF proxy, which does the same.
   */
  auth?: boolean;
  /** Call one of our own route handlers (same origin) instead of the backend. */
  sameOrigin?: boolean;
  /** ISR: seconds before the cached response is revalidated, or false to cache indefinitely. Server Components only. */
  revalidate?: number | false;
  /** ISR: cache tags for on-demand revalidation. */
  tags?: string[];
  cache?: RequestCache;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Normalized failure for every non-2xx response and network error. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const isServer = typeof window === "undefined";

/** Single place to attach auth headers (bearer tokens, CSRF, locale...) to every backend request. */
async function applyAuth(headers: Headers) {
  if (!isServer) return; // The browser never holds the token; the BFF proxy adds it.
  const { getSessionToken } = await import("@/lib/auth/session");
  const token = await getSessionToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
}

async function ensureMocking() {
  if (!env.useMocks) return;
  const { startServerMocking } = await import("@/mocks/server");
  startServerMocking();
}

const appOrigin = () => (isServer ? env.siteUrl : window.location.origin);

function resolveTarget(path: string, { auth, sameOrigin }: RequestOptions) {
  if (sameOrigin) return { base: appOrigin(), path, isBackend: false };
  if (auth && !isServer) return { base: appOrigin(), path: `${ENDPOINTS.BFF_PROXY}${path}`, isBackend: false };
  return { base: env.apiBaseUrl, path, isBackend: true };
}

function buildUrl(base: string, path: string, query?: QueryParams) {
  const url = new URL(`${base}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

interface ErrorBody {
  message?: string;
  errors?: Record<string, string | string[]>;
}

async function toApiError(response: Response) {
  let message = response.statusText || "Request failed";
  const fieldErrors: Record<string, string> = {};
  try {
    // The backend nests the details under `error`; our own route handlers put them at the top level.
    const payload = (await response.json()) as ErrorBody & { error?: ErrorBody | null };
    const body = payload.error ?? payload;
    if (body.message) message = body.message;
    for (const [field, issue] of Object.entries(body.errors ?? {})) {
      fieldErrors[field] = Array.isArray(issue) ? issue.join(" ") : issue;
    }
  } catch {
    // Non-JSON error body: keep the status text.
  }
  return new ApiError(response.status, message, fieldErrors);
}

/** Every backend response is `{ success, data, error }`; callers only care about `data`. */
function unwrapEnvelope<T>(payload: unknown): T {
  const isEnvelope =
    typeof payload === "object" && payload !== null && "success" in payload && "data" in payload && "error" in payload;
  return (isEnvelope ? (payload as { data: T }).data : payload) as T;
}

// The API sits on a host that sleeps when idle, so the first request after a pause can take a while: wait, then retry once.
const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 1_000;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

/** Aborts after the timeout, or as soon as the caller's own signal aborts. */
function withTimeout(signal?: AbortSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), REQUEST_TIMEOUT_MS);
  if (signal?.aborted) controller.abort(signal.reason);
  else signal?.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function request<T>(
  method: Method,
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { query, auth = false, revalidate, tags, cache, signal, headers: extraHeaders } = options;
  const target = resolveTarget(path, options);

  if (target.isBackend) {
    // The backend is only ever called from the server; browser code goes through our own route handlers.
    if (!isServer) throw new Error(`Backend call from the browser: ${path}. Add a route handler and call it with sameOrigin.`);
    await ensureMocking();
  }

  const headers = new Headers({ Accept: "application/json", ...extraHeaders });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (auth && target.isBackend) await applyAuth(headers);

  const next = revalidate !== undefined || tags ? { revalidate, tags } : undefined;
  const url = buildUrl(target.base, target.path, query);
  const attempts = method === "GET" && target.isBackend ? 2 : 1;

  let response: Response | undefined;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const timeout = withTimeout(signal);
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache,
        signal: timeout.signal,
        next,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      if (attempt === attempts) throw new ApiError(0, "Network error. Please check your connection.");
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      continue;
    } finally {
      timeout.clear();
    }
    if (!RETRYABLE_STATUSES.has(response.status) || attempt === attempts) break;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }

  if (!response) throw new ApiError(0, "Network error. Please check your connection.");
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json();
  return target.isBackend ? unwrapEnvelope<T>(payload) : (payload as T);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, undefined, options),
};
