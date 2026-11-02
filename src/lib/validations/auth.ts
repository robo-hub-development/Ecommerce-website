import { z } from "zod";
import { OTP_LENGTH } from "@/lib/auth/constants";

const email = z.string().trim().min(1, "Enter your email").email("Enter a valid email address");

export const loginSchema = z.object({ email });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email,
});

export const otpSchema = z.object({
  otp: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`),
});

// Request bodies accepted by the route handlers.
export const sendOtpSchema = z.discriminatedUnion("purpose", [
  loginSchema.extend({ purpose: z.literal("login") }),
  registerSchema.extend({ purpose: z.literal("register") }),
]);

export const verifyOtpSchema = otpSchema.extend({
  purpose: z.enum(["login", "register"]),
  email,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
