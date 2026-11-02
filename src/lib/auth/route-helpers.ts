import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { ApiError } from "@/lib/api/client";

/** Same error shape the backend uses, so the browser's ApiError handling works unchanged. */
export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    // Backend outages (5xx) and network failures surface as 502 so the UI can show a generic message.
    const status = error.status >= 400 && error.status < 500 ? error.status : 502;
    return NextResponse.json({ message: error.message, errors: error.fieldErrors }, { status });
  }
  return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
}

export function validationErrorResponse(error: ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return NextResponse.json({ message: "Please check the highlighted fields.", errors }, { status: 400 });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
