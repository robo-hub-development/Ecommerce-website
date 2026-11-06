import { describe, expect, it } from "vitest";
import { PROTECTED_PATHS, isPathUnder } from "@/lib/auth/constants";

describe("protected paths", () => {
  it.each(["/cart", "/account", "/account/orders/1", "/checkout/payment", "/order/1/confirmation"])("%s needs a session", (path) => {
    expect(isPathUnder(path, PROTECTED_PATHS)).toBe(true);
  });

  it.each(["/", "/products", "/cartography", "/blog/cart-guide"])("%s is public", (path) => {
    expect(isPathUnder(path, PROTECTED_PATHS)).toBe(false);
  });
});
