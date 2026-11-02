import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/api/auth-backend";
import { errorResponse, readJson, validationErrorResponse } from "@/lib/auth/route-helpers";
import { sendOtpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const parsed = sendOtpSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    return NextResponse.json(await requestOtp(parsed.data));
  } catch (error) {
    return errorResponse(error);
  }
}
