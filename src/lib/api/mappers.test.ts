import { describe, expect, it } from "vitest";
import { mapCart } from "@/lib/api/mappers";

describe("mapCart", () => {
  it("keeps the backend line id so the line can be deleted", () => {
    const {
      items: [line],
    } = mapCart({
      items: [{ id: "6f1c", productId: 7, slug: "esp32", name: "ESP32", price: "599", image: "/a.png", quantity: 2 }],
    });
    expect(line).toMatchObject({ lineId: "6f1c", productId: "7", price: 599, quantity: 2 });
  });

  it("leaves lineId empty when the backend sends none", () => {
    const {
      items: [line],
    } = mapCart({ items: [{ productId: 1, slug: "a", name: "A", price: 1, image: "/a.png", quantity: 1 }] });
    expect(line.lineId).toBeUndefined();
  });
});
