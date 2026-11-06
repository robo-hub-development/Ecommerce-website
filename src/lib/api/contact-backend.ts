import "server-only";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ContactMessageInput } from "@/types/contact";

// Backend-facing contact call. Only app/api/contact uses it; the browser goes through lib/api/contact.ts.

export function sendContactWithBackend(input: Omit<ContactMessageInput, "website">): Promise<{ sent: boolean }> {
  return api.post(ENDPOINTS.CONTACT, input);
}
