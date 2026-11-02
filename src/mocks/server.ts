import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

// Dev HMR re-evaluates this module and Next re-patches global fetch; keep state on globalThis so interceptors never stack.
const globalForMsw = globalThis as typeof globalThis & {
  __mswServer?: ReturnType<typeof setupServer>;
  __mswFetch?: typeof fetch;
};

export function startServerMocking() {
  // Interceptor still installed on the current global fetch: nothing to do.
  if (globalForMsw.__mswServer && globalThis.fetch === globalForMsw.__mswFetch) return;

  globalForMsw.__mswServer?.close();
  globalForMsw.__mswServer ??= setupServer(...handlers);
  globalForMsw.__mswServer.listen({ onUnhandledFrame: "bypass" });
  globalForMsw.__mswFetch = globalThis.fetch;
}
