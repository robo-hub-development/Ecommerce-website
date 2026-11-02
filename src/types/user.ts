export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

export interface AuthSession {
  user: User;
  /** Opaque session token; the BFF keeps it in an httpOnly cookie and never sends it to the browser. */
  token: string;
  maxAgeSeconds: number;
}

export type OtpPurpose = "login" | "register";

export interface SendOtpInput {
  purpose: OtpPurpose;
  email: string;
  /** Register only. */
  name?: string;
  /** Register only. */
  mobile?: string;
}

export interface VerifyOtpInput {
  purpose: OtpPurpose;
  email: string;
  otp: string;
}

export interface OtpReceipt {
  expiresInSeconds: number;
}
