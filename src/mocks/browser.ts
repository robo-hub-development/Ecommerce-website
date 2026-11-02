import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks/handlers";

let started: Promise<unknown> | undefined;

export function startMocking() {
  started ??= setupWorker(...handlers).start({ onUnhandledFrame: "bypass" });
  return started;
}
