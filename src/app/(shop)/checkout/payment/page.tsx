import type { Metadata } from "next";
import { PaymentReturn } from "@/components/checkout/payment-return";

export const metadata: Metadata = {
  title: "Confirming your payment",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function PaymentReturnPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  // `reference` is ours; Razorpay's payment-link redirect appends razorpay_payment_link_reference_id.
  const reference = first(params.reference) ?? first(params.razorpay_payment_link_reference_id);
  return (
    <div className="container-page flex max-w-2xl flex-col gap-6 py-8 lg:py-12">
      <h1 className="text-h1">Payment</h1>
      <PaymentReturn reference={reference} />
    </div>
  );
}
