import type { RazorpayConstructor } from "@/types/payment";

type ScriptStatus = "loading" | "ready" | "error";

let status: ScriptStatus = "loading";
const listeners = new Set<() => void>();

/** Called by <RazorpayScript> (next/script) when checkout.js has loaded or failed. */
export function setRazorpayScriptStatus(next: ScriptStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

/** Resolves with the Razorpay constructor once the script is ready; rejects if it failed or took too long. */
export function waitForRazorpay(timeoutMs = 15_000): Promise<RazorpayConstructor> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      listeners.delete(check);
    };
    const check = () => {
      if (typeof window !== "undefined" && window.Razorpay) {
        cleanup();
        resolve(window.Razorpay);
      } else if (status === "error") {
        cleanup();
        reject(new Error("Couldn't load the payment window."));
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("The payment window took too long to load."));
    }, timeoutMs);
    listeners.add(check);
    check();
  });
}
