import { NextResponse } from "next/server";
import { subscribeWithBackend } from "@/lib/api/newsletter-backend";
import { errorResponse, readJson, validationErrorResponse } from "@/lib/auth/route-helpers";
import { newsletterSchema } from "@/lib/validations/newsletter";

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    return NextResponse.json(await subscribeWithBackend(parsed.data.email));
  } catch (error) {
    return errorResponse(error);
  }
}
