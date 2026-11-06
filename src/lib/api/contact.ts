import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ContactMessageInput } from "@/types/contact";

// Browser-facing contact call. It hits our own route handler, which talks to the backend.

export function sendContactMessage(input: ContactMessageInput): Promise<{ sent: boolean }> {
  return api.post(ENDPOINTS.BFF_CONTACT, input, { sameOrigin: true });
}
