import "server-only";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

// Backend-facing newsletter call. Only app/api/newsletter uses it; the browser goes through lib/api/newsletter.ts.

export function subscribeWithBackend(email: string): Promise<{ subscribed: boolean }> {
  return api.post(ENDPOINTS.NEWSLETTER, { email });
}
