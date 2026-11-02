import { NextResponse } from "next/server";
import { verifyOtpWithBackend } from "@/lib/api/auth-backend";
import { errorResponse, readJson, validationErrorResponse } from "@/lib/auth/route-helpers";
import { setSessionCookie } from "@/lib/auth/session";
import { verifyOtpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const parsed = verifyOtpSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    const { user, token, maxAgeSeconds } = await verifyOtpWithBackend(parsed.data);
    await setSessionCookie(token, maxAgeSeconds);
    // The token stays on the server; the browser only learns who signed in.
    return NextResponse.json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
