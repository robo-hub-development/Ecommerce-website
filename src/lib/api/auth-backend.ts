import "server-only";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapAuthSession, mapCurrentUser, mapOtpReceipt } from "@/lib/api/mappers";
import type { RawAuthSession, RawCurrentUser, RawOtpReceipt } from "@/types/dto";
import type { AuthSession, OtpReceipt, SendOtpInput, User, VerifyOtpInput } from "@/types/user";

// Backend-facing auth calls. Only the route handlers under app/api/auth use these;
// the browser talks to those handlers through lib/api/auth.ts.

export async function requestOtp(input: SendOtpInput): Promise<OtpReceipt> {
  return mapOtpReceipt(await api.post<RawOtpReceipt>(ENDPOINTS.AUTH_SEND_OTP, input));
}

/** Returns the session token so the route handler can store it in the httpOnly cookie. */
export async function verifyOtpWithBackend(input: VerifyOtpInput): Promise<AuthSession> {
  return mapAuthSession(await api.post<RawAuthSession>(ENDPOINTS.AUTH_VERIFY_OTP, input));
}

export async function fetchCurrentUser(): Promise<User> {
  return mapCurrentUser(await api.get<RawCurrentUser>(ENDPOINTS.AUTH_ME, { auth: true, cache: "no-store" }));
}

export function endBackendSession(): Promise<void> {
  return api.post<void>(ENDPOINTS.AUTH_LOGOUT, undefined, { auth: true });
}
