const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number) => inr.format(value);

export function discountPercent(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "always" });

const TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "22 hours ago", "3 days ago"... Rendered on the server, so it is as fresh as the page's last revalidation. */
export function formatTimeAgo(iso: string, now = Date.now()) {
  // A clock slightly ahead of the publisher's must not produce "in 2 minutes".
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  for (const [unit, size] of TIME_UNITS) {
    if (seconds >= size) return relativeTime.format(-Math.floor(seconds / size), unit);
  }
  return "Just now";
}
