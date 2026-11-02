import { z } from "zod";

// The only module allowed to read process.env. NEXT_PUBLIC_* values must be referenced statically so Next can inline them for the browser.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

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
    NEXT_PUBLIC_API_BASE_URL: optionalUrl,
    API_BASE_URL: optionalUrl,
    NEXT_PUBLIC_USE_MOCKS: z.preprocess(emptyToUndefined, z.enum(["true", "false"]).default("false")),
    NEXT_PUBLIC_YOUTUBE_CHANNEL_URL: optionalText,
    NEXT_PUBLIC_INSTAGRAM_URL: optionalText,
    NEXT_PUBLIC_SUPPORT_EMAIL: optionalText,
    NEXT_PUBLIC_SUPPORT_PHONE: optionalText,
  })
  .superRefine((value, ctx) => {
    if (value.NEXT_PUBLIC_USE_MOCKS === "false" && !value.NEXT_PUBLIC_API_BASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_API_BASE_URL"],
        message: "Required when NEXT_PUBLIC_USE_MOCKS is not true",
      });
    }
  });

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  NEXT_PUBLIC_YOUTUBE_CHANNEL_URL: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL,
  NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  NEXT_PUBLIC_SUPPORT_PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

const data = parsed.data;
const useMocks = data.NEXT_PUBLIC_USE_MOCKS === "true";
// With mocks on, MSW intercepts before any request leaves the process, so an unset base URL falls back to a path that no real route uses (/api is reserved for our own route handlers).
const clientApiBaseUrl = data.NEXT_PUBLIC_API_BASE_URL ?? `${data.NEXT_PUBLIC_SITE_URL}/mock-api`;

export const env = {
  isProduction: data.NODE_ENV === "production",
  siteUrl: data.NEXT_PUBLIC_SITE_URL,
  /** Base URL for requests made from the browser. */
  clientApiBaseUrl,
  /** Base URL for requests made from Server Components (falls back to the client URL). */
  serverApiBaseUrl: data.API_BASE_URL ?? clientApiBaseUrl,
  useMocks,
  youtubeChannelUrl: data.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL ?? "",
  instagramUrl: data.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  supportEmail: data.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
  supportPhone: data.NEXT_PUBLIC_SUPPORT_PHONE ?? "",
} as const;

export type Env = typeof env;
