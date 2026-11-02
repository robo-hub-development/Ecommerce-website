import { endBackendSession } from "@/lib/api/auth-backend";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await endBackendSession();
  } catch {
    // Best effort: the shopper is signed out locally even if the backend call fails.
  }
  await clearSessionCookie();
  return new Response(null, { status: 204 });
}
