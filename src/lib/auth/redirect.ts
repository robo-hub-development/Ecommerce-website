/**
 * Validates a post-login `next` target so it can only be a path on this site.
 * Rejects absolute URLs, protocol-relative URLs ("//evil.com") and backslash tricks.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  // Control characters can be used to smuggle a different origin past naive checks.
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}
