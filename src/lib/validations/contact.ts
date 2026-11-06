import { z } from "zod";

export const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "Name is too long"),
  email: z.string().min(1, "Enter your email").email("Enter a valid email address"),
  phone: z.string().regex(INDIAN_MOBILE, "Enter a valid 10-digit mobile number"),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(1000, "Keep it under 1000 characters"),
  /** Honeypot: hidden from people, filled by bots. */
  website: z.string().max(0).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
