import { env } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Server-side only (route handlers and Server Components). The token never reaches client JavaScript.
// `next/headers` is imported lazily because the shared API client reaches this module through a server-only branch,
// and a static import would make the bundler reject the client build.
const serverCookies = async () => (await import("next/headers")).cookies();

export async function getSessionToken() {
  return (await serverCookies()).get(SESSION_COOKIE)?.value;
}

export async function setSessionCookie(token: string, maxAgeSeconds: number) {
  (await serverCookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  (await serverCookies()).delete(SESSION_COOKIE);
}
