import type { PaymentOutcome } from "@/types/order";

export const POLL_INTERVAL_MS = 3_000;
export const POLL_MAX_MS = 60_000;

export type PollResult = PaymentOutcome | { status: "timeout" };

interface PollOptions {
  intervalMs?: number;
  maxMs?: number;
  sleep?: (ms: number) => Promise<void>;
  signal?: AbortSignal;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Asks the backend for the payment outcome every `intervalMs` until it is final (success or failed) or `maxMs` passes.
 * Request errors count as "still pending": an unreachable backend is not evidence that the payment failed.
 */
export async function pollPaymentOutcome(
  fetchOutcome: () => Promise<PaymentOutcome>,
  { intervalMs = POLL_INTERVAL_MS, maxMs = POLL_MAX_MS, sleep = wait, signal }: PollOptions = {},
): Promise<PollResult> {
  for (let elapsed = 0; elapsed <= maxMs; elapsed += intervalMs) {
    if (signal?.aborted) return { status: "timeout" };
    try {
      const outcome = await fetchOutcome();
      // "success" without an order means the order is still being created: keep waiting for it.
      if (outcome.status === "failed" || (outcome.status === "success" && outcome.order)) return outcome;
    } catch {
      // Keep polling.
    }
    if (elapsed + intervalMs > maxMs) break;
    await sleep(intervalMs);
  }
  return { status: "timeout" };
}
