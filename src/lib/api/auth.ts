import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapCurrentUser, mapOtpReceipt } from "@/lib/api/mappers";
import type { RawCurrentUser, RawOtpReceipt } from "@/types/dto";
import type { OtpReceipt, SendOtpInput, User, VerifyOtpInput } from "@/types/user";

// Browser-facing auth calls. They hit our own route handlers (BFF), which talk to the backend
// and keep the session token in an httpOnly cookie.

export async function sendOtp(input: SendOtpInput): Promise<OtpReceipt> {
  return mapOtpReceipt(await api.post<RawOtpReceipt>(ENDPOINTS.BFF_AUTH_SEND_OTP, input, { sameOrigin: true }));
}

/** Verifies the code. On success the session cookie is set and the user is returned. Register also creates the account. */
export async function verifyOtp(input: VerifyOtpInput): Promise<User> {
  return mapCurrentUser(await api.post<RawCurrentUser>(ENDPOINTS.BFF_AUTH_VERIFY_OTP, input, { sameOrigin: true }));
}

/** Returns the signed-in user; throws ApiError(401) when there is no valid session. */
export async function getSession(): Promise<User> {
  return mapCurrentUser(
    await api.get<RawCurrentUser>(ENDPOINTS.BFF_AUTH_ME, { sameOrigin: true, cache: "no-store" }),
  );
}

export function logout(): Promise<void> {
  return api.post<void>(ENDPOINTS.BFF_AUTH_LOGOUT, undefined, { sameOrigin: true });
}
