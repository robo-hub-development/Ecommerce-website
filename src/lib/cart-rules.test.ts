import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QUANTITY_PER_PRODUCT,
  SHIPPING_FEE,
  addToLines,
  clampQuantity,
  computeBill,
  getCodEligibility,
  removeLine,
  setLineQuantity,
  toServerLines,
} from "@/lib/cart-rules";
import type { CartItem } from "@/types/cart";

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: "p1",
  slug: "p1",
  name: "Product",
  price: 500,
  image: "/x.svg",
  quantity: 1,
  ...overrides,
});

describe("toServerLines", () => {
  it("sends only the product id and a capped quantity", () => {
    expect(toServerLines([item({ quantity: 3, variantId: "v1" }), item({ productId: "p2", quantity: 99 })])).toEqual([
      { productId: "p1", quantity: 3 },
      { productId: "p2", quantity: MAX_QUANTITY_PER_PRODUCT },
    ]);
  });
});

describe("getCodEligibility", () => {
  it("allows exactly one item with quantity 1", () => {
    expect(getCodEligibility([item()])).toEqual({ eligible: true });
  });

  it("rejects an empty cart", () => {
    expect(getCodEligibility([])).toMatchObject({ eligible: false, reason: expect.stringMatching(/empty/i) });
  });

  it("rejects a single item with quantity above 1", () => {
    const result = getCodEligibility([item({ quantity: 2 })]);
    expect(result).toMatchObject({ eligible: false, reason: expect.stringMatching(/quantity of 1/i) });
  });

  it("rejects two different items even when each has quantity 1", () => {
    const result = getCodEligibility([item(), item({ productId: "p2" })]);
    expect(result).toMatchObject({ eligible: false, reason: expect.stringMatching(/single item/i) });
  });

  it("rejects the same product in two variants", () => {
    expect(getCodEligibility([item({ variantId: "a" }), item({ variantId: "b" })]).eligible).toBe(false);
  });

  it("rejects at the maximum quantity", () => {
    expect(getCodEligibility([item({ quantity: MAX_QUANTITY_PER_PRODUCT })]).eligible).toBe(false);
  });
});

describe("clampQuantity", () => {
  it.each([
    [1, 1],
    [5, 5],
    [10, 10],
    [11, 10],
    [999, 10],
    [0, 1],
    [-3, 1],
    [2.9, 2],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampQuantity(input)).toBe(expected);
  });
});

describe("addToLines", () => {
  const { quantity, ...base } = item();
  void quantity;

  it("adds a new line", () => {
    const { items, result } = addToLines([], base, 2);
    expect(items).toEqual([item({ quantity: 2 })]);
    expect(result).toBe("added");
  });

  it("merges into an existing line", () => {
    const { items, result } = addToLines([item({ quantity: 3 })], base, 2);
    expect(items[0].quantity).toBe(5);
    expect(result).toBe("added");
  });

  it("caps at the limit and reports it", () => {
    const { items, result } = addToLines([item({ quantity: 8 })], base, 5);
    expect(items[0].quantity).toBe(MAX_QUANTITY_PER_PRODUCT);
    expect(result).toBe("capped");
  });

  it("allows reaching the limit exactly without reporting a cap", () => {
    const { items, result } = addToLines([item({ quantity: 8 })], base, 2);
    expect(items[0].quantity).toBe(10);
    expect(result).toBe("added");
  });

  it("reports maxed and leaves the cart untouched when already at the limit", () => {
    const cart = [item({ quantity: 10 })];
    const { items, result } = addToLines(cart, base, 1);
    expect(items).toBe(cart);
    expect(result).toBe("maxed");
  });

  it("caps a new line requested above the limit", () => {
    const { items, result } = addToLines([], base, 25);
    expect(items[0].quantity).toBe(10);
    expect(result).toBe("capped");
  });

  it("keeps variants of one product on separate lines", () => {
    const first = addToLines([], { ...base, variantId: "a" }).items;
    const { items } = addToLines(first, { ...base, variantId: "b" });
    expect(items).toHaveLength(2);
  });

  it("does not mutate the input", () => {
    const cart = [item({ quantity: 3 })];
    addToLines(cart, base, 2);
    expect(cart[0].quantity).toBe(3);
  });
});

describe("setLineQuantity / removeLine", () => {
  it("clamps updates above the limit", () => {
    expect(setLineQuantity([item()], { productId: "p1" }, 50)[0].quantity).toBe(10);
  });

  it("never goes below 1", () => {
    expect(setLineQuantity([item({ quantity: 3 })], { productId: "p1" }, 0)[0].quantity).toBe(1);
  });

  it("only touches the matching variant", () => {
    const cart = [item({ variantId: "a" }), item({ variantId: "b" })];
    const next = setLineQuantity(cart, { productId: "p1", variantId: "b" }, 4);
    expect(next.map((line) => line.quantity)).toEqual([1, 4]);
  });

  it("removes only the matching line", () => {
    const cart = [item({ variantId: "a" }), item({ variantId: "b" })];
    expect(removeLine(cart, { productId: "p1", variantId: "a" })).toEqual([cart[1]]);
  });
});

describe("computeBill", () => {
  it("is all zeros for an empty cart", () => {
    expect(computeBill([])).toEqual({
      itemsTotal: 0,
      discount: 0,
      shipping: 0,
      grandTotal: 0,
      amountToFreeShipping: 0,
    });
  });

  it("charges shipping below the free-shipping threshold", () => {
    const bill = computeBill([item({ price: 500, quantity: 1 })]);
    expect(bill.shipping).toBe(SHIPPING_FEE);
    expect(bill.grandTotal).toBe(500 + SHIPPING_FEE);
    expect(bill.amountToFreeShipping).toBe(FREE_SHIPPING_THRESHOLD - 500);
  });

  it("ships free at exactly the threshold", () => {
    const bill = computeBill([item({ price: FREE_SHIPPING_THRESHOLD })]);
    expect(bill.shipping).toBe(0);
    expect(bill.amountToFreeShipping).toBe(0);
  });

  it("derives the discount from list prices", () => {
    const bill = computeBill([item({ price: 1500, compareAtPrice: 2000, quantity: 2 })]);
    expect(bill.itemsTotal).toBe(4000);
    expect(bill.discount).toBe(1000);
    expect(bill.grandTotal).toBe(3000);
  });

  it("ignores a list price below the selling price", () => {
    const bill = computeBill([item({ price: 1500, compareAtPrice: 1000 })]);
    expect(bill.discount).toBe(0);
    expect(bill.itemsTotal).toBe(1500);
  });
});
