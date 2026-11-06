import { z } from "zod";
import { RETURN_REASONS } from "@/types/order";

export const RETURN_MAX_FILES = 4;
export const RETURN_MAX_FILE_BYTES = 4 * 1024 * 1024;
export const RETURN_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];

export const returnSchema = z.object({
  reason: z.enum(RETURN_REASONS.map((r) => r.value) as [string, ...string[]], { error: "Choose a reason" }),
  description: z.string().trim().min(10, "Describe the problem (at least 10 characters)").max(1000, "Keep it under 1000 characters"),
});

export type ReturnValues = z.infer<typeof returnSchema>;

/** Returns an error message for a file the form should reject, or null when it is fine. */
export function validateReturnFile(file: File): string | null {
  if (!RETURN_ACCEPTED_TYPES.includes(file.type)) return `${file.name}: only JPG, PNG, WebP, MP4 or MOV files are allowed.`;
  if (file.size > RETURN_MAX_FILE_BYTES) return `${file.name}: files must be under ${RETURN_MAX_FILE_BYTES / 1024 / 1024} MB.`;
  return null;
}
