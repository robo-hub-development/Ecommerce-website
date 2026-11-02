import { NextResponse } from "next/server";
import { fetchCurrentUser } from "@/lib/api/auth-backend";
import { ApiError } from "@/lib/api/client";
import { errorResponse } from "@/lib/auth/route-helpers";
import { clearSessionCookie, getSessionToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSessionToken())) {
    return NextResponse.json({ message: "Not signed in" }, { status: 401 });
  }

  try {
    return NextResponse.json({ user: await fetchCurrentUser() });
  } catch (error) {
    // An expired or revoked token: drop the cookie so the middleware stops treating the visitor as signed in.
    if (error instanceof ApiError && error.status === 401) await clearSessionCookie();
    return errorResponse(error);
  }
}
