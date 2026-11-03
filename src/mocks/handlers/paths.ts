import { env } from "@/lib/env";

// Match any origin and pin only the API path prefix.
const prefix = new URL(env.apiBaseUrl).pathname.replace(/\/+$/, "");

/** Turns an endpoint from endpoints.ts into an MSW matcher. */
export const mockPath = (endpoint: string) => `*${prefix}${endpoint}`;
