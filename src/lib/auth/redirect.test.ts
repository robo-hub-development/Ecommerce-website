import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/redirect";

describe("safeRedirectPath", () => {
  it.each(["/checkout", "/account/orders?page=2", "/products/atlas-rover-kit#reviews"])("keeps %s", (path) => {
    expect(safeRedirectPath(path)).toBe(path);
  });

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "checkout",
    "/ok\nhttps://evil.com",
    "",
  ])("rejects %j", (path) => {
    expect(safeRedirectPath(path)).toBe("/");
  });

  it("falls back for missing values and honours a custom fallback", () => {
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath(null, "/account")).toBe("/account");
  });
});
