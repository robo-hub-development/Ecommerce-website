import { NextResponse, type NextRequest } from "next/server";
import { GUEST_ONLY_PATHS, PROTECTED_PATHS, SESSION_COOKIE, isPathUnder } from "@/lib/auth/constants";
import { safeRedirectPath } from "@/lib/auth/redirect";

// Presence check only (cheap, runs on the edge). The cookie's token is verified by the backend on every real call,
// and /api/auth/me clears it when it turns out to be expired.
export function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && isPathUnder(pathname, PROTECTED_PATHS)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (hasSession && isPathUnder(pathname, GUEST_ONLY_PATHS)) {
    return NextResponse.redirect(new URL(safeRedirectPath(searchParams.get("next")), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/cart/:path*", "/checkout/:path*", "/order/:path*", "/login", "/register"],
};
