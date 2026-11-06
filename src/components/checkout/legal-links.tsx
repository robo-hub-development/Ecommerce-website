import Link from "next/link";

const link = "font-medium text-foreground underline underline-offset-2 hover:text-primary";

/** Consent line shown where the customer commits to an order. */
export function LegalLinks() {
  return (
    <p className="text-xs text-muted-foreground">
      By placing the order you agree to our{" "}
      <Link href="/privacy-policy-terms" className={link}>
        Terms &amp; Privacy Policy
      </Link>
      . See also our{" "}
      <Link href="/shipping-returns-refunds" className={link}>
        Shipping, Returns &amp; Refunds
      </Link>{" "}
      policy.
    </p>
  );
}
