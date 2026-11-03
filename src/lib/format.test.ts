import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "@/lib/format";

const NOW = Date.parse("2026-11-03T12:00:00Z");
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe("formatTimeAgo", () => {
  it.each([
    [30, "Just now"],
    [60, "1 minute ago"],
    [45 * 60, "45 minutes ago"],
    [22 * 3_600 + 40 * 60, "22 hours ago"],
    [86_400, "1 day ago"],
    [3 * 86_400, "3 days ago"],
    [14 * 86_400, "2 weeks ago"],
    [65 * 86_400, "2 months ago"],
    [800 * 86_400, "2 years ago"],
  ])("%i seconds -> %s", (seconds, expected) => {
    expect(formatTimeAgo(ago(seconds), NOW)).toBe(expected);
  });

  it("never reports a future time", () => {
    expect(formatTimeAgo(ago(-300), NOW)).toBe("Just now");
  });
});
