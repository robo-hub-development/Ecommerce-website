import { env } from "@/lib/env";

// Server and browser use different base URLs, so match any origin and pin only the API path prefix.
const prefix = new URL(env.clientApiBaseUrl).pathname.replace(/\/+$/, "");

/** Turns an endpoint from endpoints.ts into an MSW matcher. */
export const mockPath = (endpoint: string) => `*${prefix}${endpoint}`;
