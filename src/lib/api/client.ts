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
  if (isServer) {
    const { startServerMocking } = await import("@/mocks/server");
    startServerMocking();
  } else {
    const { startMocking } = await import("@/mocks/browser");
    await startMocking();
  }
}

const appOrigin = () => (isServer ? env.siteUrl : window.location.origin);

function resolveTarget(path: string, { auth, sameOrigin }: RequestOptions) {
  if (sameOrigin) return { base: appOrigin(), path, isBackend: false };
  if (auth && !isServer) return { base: appOrigin(), path: `${ENDPOINTS.BFF_PROXY}${path}`, isBackend: false };
  return { base: isServer ? env.serverApiBaseUrl : env.clientApiBaseUrl, path, isBackend: true };
}

function buildUrl(base: string, path: string, query?: QueryParams) {
  const url = new URL(`${base}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

async function toApiError(response: Response) {
  let message = response.statusText || "Request failed";
  const fieldErrors: Record<string, string> = {};
  try {
    const payload = (await response.json()) as {
      message?: string;
      errors?: Record<string, string | string[]>;
    };
    if (payload.message) message = payload.message;
    for (const [field, issue] of Object.entries(payload.errors ?? {})) {
      fieldErrors[field] = Array.isArray(issue) ? issue.join(" ") : issue;
    }
  } catch {
    // Non-JSON error body: keep the status text.
  }
  return new ApiError(response.status, message, fieldErrors);
}

async function request<T>(
  method: Method,
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { query, auth = false, revalidate, tags, cache, signal, headers: extraHeaders } = options;
  const target = resolveTarget(path, options);

  if (target.isBackend) await ensureMocking();

  const headers = new Headers({ Accept: "application/json", ...extraHeaders });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (auth && target.isBackend) await applyAuth(headers);

  const next = revalidate !== undefined || tags ? { revalidate, tags } : undefined;

  let response: Response;
  try {
    response = await fetch(buildUrl(target.base, target.path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache,
      signal,
      next,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Network error. Please check your connection.");
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, undefined, options),
};
