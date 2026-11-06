import { describe, expect, it } from "vitest";
import { checkoutAddressSchema } from "@/lib/validations/checkout";

const valid = {
  fullName: "Aarav Mehta",
  mobile: "9876543210",
  email: "aarav@example.com",
  line1: "12 MG Road",
  landmark: "",
  pincode: "560001",
  state: "Karnataka",
  city: "Bengaluru",
  billingSameAsShipping: true,
};

const issuePaths = (value: unknown) => {
  const result = checkoutAddressSchema.safeParse(value);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
};

describe("checkoutAddressSchema", () => {
  it("accepts a complete address", () => {
    expect(checkoutAddressSchema.safeParse(valid).success).toBe(true);
  });

  it.each(["987654321", "98765432101", "98765abcde", ""])("rejects mobile %j", (mobile) => {
    expect(issuePaths({ ...valid, mobile })).toContain("mobile");
  });

  it.each(["56001", "5600011", "56000a", ""])("rejects pincode %j", (pincode) => {
    expect(issuePaths({ ...valid, pincode })).toContain("pincode");
  });

  it("does not ask for billing details when billing is the same as shipping", () => {
    expect(issuePaths({ ...valid, billing: undefined })).toEqual([]);
  });

  it("requires a billing address when it differs from shipping", () => {
    const paths = issuePaths({ ...valid, billingSameAsShipping: false });
    expect(paths).toEqual(expect.arrayContaining(["billing.line1", "billing.pincode", "billing.city", "billing.state"]));
  });

  it("validates the billing pincode too", () => {
    const billing = { line1: "1 Street", landmark: "", pincode: "12", state: "KA", city: "Bengaluru" };
    expect(issuePaths({ ...valid, billingSameAsShipping: false, billing })).toEqual(["billing.pincode"]);
  });
});
