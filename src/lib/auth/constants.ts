export const SESSION_COOKIE = "srh_session";

/** Routes that need a signed-in user (matched by the middleware). */
export const PROTECTED_PATHS = ["/account", "/checkout"];

/** Routes a signed-in user has no reason to see. */
export const GUEST_ONLY_PATHS = ["/login", "/register"];

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;

export const isPathUnder = (pathname: string, bases: string[]) =>
  bases.some((base) => pathname === base || pathname.startsWith(`${base}/`));
