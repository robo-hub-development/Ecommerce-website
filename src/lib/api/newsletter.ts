import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

// Browser-facing newsletter call. It hits our own route handler, which talks to the backend.

export function subscribeToNewsletter(email: string): Promise<{ subscribed: boolean }> {
  return api.post(ENDPOINTS.BFF_NEWSLETTER, { email }, { sameOrigin: true });
}
