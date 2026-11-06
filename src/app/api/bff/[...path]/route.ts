import { NextResponse } from "next/server";
import { ApiError, api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { errorResponse, readJson } from "@/lib/auth/route-helpers";
import { clearSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Authenticated proxy for browser calls. `api` (with `auth: true`) adds the bearer token from the
 * httpOnly cookie, so the token never touches client JavaScript. Only these backend areas are reachable.
 */
const ALLOWED_AREAS = [ENDPOINTS.CART, ENDPOINTS.ORDERS, ENDPOINTS.PAYMENT_STATUS("").replace(/\/$/, "")];

type Context = { params: Promise<{ path: string[] }> };

/** JSON bodies by default; multipart uploads (return-request photos) are forwarded as FormData. */
async function readBody(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    try {
      return await request.formData();
    } catch {
      return undefined;
    }
  }
  return readJson(request);
}

async function proxy(request: Request, { params }: Context) {
  const segments = (await params).path;
  const unsafe = segments.some((s) => s === "." || s === ".." || s.includes("/") || s.includes("\\"));
  const path = `/${segments.join("/")}`;
  const allowed = ALLOWED_AREAS.some((area) => path === area || path.startsWith(`${area}/`));
  if (unsafe || !allowed) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const options = {
    auth: true,
    cache: "no-store" as const,
    query: Object.fromEntries(new URL(request.url).searchParams),
  };

  try {
    let result: unknown;
    switch (request.method) {
      case "GET":
        result = await api.get(path, options);
        break;
      case "DELETE":
        result = await api.delete(path, options);
        break;
      case "POST":
        result = await api.post(path, await readBody(request), options);
        break;
      case "PUT":
        result = await api.put(path, await readBody(request), options);
        break;
      default:
        result = await api.patch(path, await readBody(request), options);
    }
    return result === undefined ? new Response(null, { status: 204 }) : NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) await clearSessionCookie();
    return errorResponse(error);
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
