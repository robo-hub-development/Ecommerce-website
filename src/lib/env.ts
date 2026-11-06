import { z } from "zod";

// The only module allowed to read process.env. NEXT_PUBLIC_* values must be referenced statically so Next can inline them for the browser.
// Dashboards and CLIs often store stray whitespace (a piped value picks up a trailing CRLF), wrapping quotes, or a literal '' / "" for "empty".
// Clean those up first so a copy-paste slip in a hosting dashboard cannot break the build; an empty result counts as unset.
const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const cleaned = value.trim().replace(/^(["'])(.*)\1$/, "$2").trim();
  return cleaned === "" ? undefined : cleaned;
};

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z
    .url()
    .transform((value) => value.replace(/\/+$/, ""))
    .optional(),
);

const optionalText = z.preprocess(emptyToUndefined, z.string().optional());

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXT_PUBLIC_SITE_URL: z.url().transform((value) => value.replace(/\/+$/, "")),
    API_BASE_URL: optionalUrl,
    NEXT_PUBLIC_USE_MOCKS: z.preprocess(emptyToUndefined, z.enum(["true", "false"]).default("false")),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: optionalText,
    NEXT_PUBLIC_YOUTUBE_CHANNEL_URL: optionalText,
    NEXT_PUBLIC_INSTAGRAM_URL: optionalText,
  })
  .superRefine((value, ctx) => {
    // API_BASE_URL is server-only, so it is legitimately absent when this module is evaluated in the browser.
    if (typeof window === "undefined" && value.NEXT_PUBLIC_USE_MOCKS === "false" && !value.API_BASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["API_BASE_URL"],
        message: "Required when NEXT_PUBLIC_USE_MOCKS is not true",
      });
    }
  });

// Vercel injects the production hostname (no protocol), so a deploy works without NEXT_PUBLIC_SITE_URL being set by hand.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const fallbackSiteUrl = vercelHost ? `https://${vercelHost}` : undefined;

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl,
  API_BASE_URL: process.env.API_BASE_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_YOUTUBE_CHANNEL_URL: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL,
  NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

const data = parsed.data;
const useMocks = data.NEXT_PUBLIC_USE_MOCKS === "true";
export const env = {
  isProduction: data.NODE_ENV === "production",
  siteUrl: data.NEXT_PUBLIC_SITE_URL,
  /**
   * Backend base URL. Server-only: the browser never calls the backend, it goes through our route handlers.
   * With mocks on and no URL set, MSW intercepts before any request leaves the process, so an unused path under /mock-api stands in
   * (/api is reserved for our own route handlers).
   */
  apiBaseUrl: data.API_BASE_URL ?? `${data.NEXT_PUBLIC_SITE_URL}/mock-api`,
  useMocks,
  /** Public Razorpay key id (never the secret). Unset: online payment falls back to the backend's redirect flow. */
  razorpayKeyId: data.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  youtubeChannelUrl: data.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL ?? "",
  instagramUrl: data.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
} as const;

export type Env = typeof env;
