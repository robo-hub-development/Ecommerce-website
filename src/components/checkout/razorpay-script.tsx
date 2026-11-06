"use client";

import Script from "next/script";
import { setRazorpayScriptStatus } from "@/lib/payments/razorpay-script";

const CHECKOUT_JS = "https://checkout.razorpay.com/v1/checkout.js";

/** Rendered only by the checkout page, so checkout.js never loads anywhere else. */
export function RazorpayScript() {
  return (
    <Script
      src={CHECKOUT_JS}
      strategy="lazyOnload"
      onReady={() => setRazorpayScriptStatus("ready")}
      onError={() => setRazorpayScriptStatus("error")}
    />
  );
}
