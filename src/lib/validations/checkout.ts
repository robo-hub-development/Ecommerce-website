import { z } from "zod";

const mobile = z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number");
const pincode = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode");
const required = (label: string, max = 100) =>
  z.string().trim().min(1, `Enter ${label}`).max(max, `${label[0].toUpperCase()}${label.slice(1)} is too long`);

/** Street address block shared by shipping and billing. */
const addressBlock = {
  line1: required("your address", 200),
  landmark: z.string().trim().max(200, "Landmark is too long"),
  pincode,
  state: required("your state"),
  city: required("your city"),
};

export const billingAddressSchema = z.object(addressBlock);

export const checkoutAddressSchema = z
  .object({
    fullName: required("your full name", 120),
    mobile,
    email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
    ...addressBlock,
    billingSameAsShipping: z.boolean(),
    // Unvalidated here: the refinement below checks it only when billing differs from shipping.
    billing: z.record(z.string(), z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.billingSameAsShipping) return;
    const parsed = billingAddressSchema.safeParse(value.billing ?? {});
    if (parsed.success) return;
    for (const issue of parsed.error.issues) {
      ctx.addIssue({ code: "custom", message: issue.message, path: ["billing", ...issue.path] });
    }
  });

export type CheckoutAddressValues = z.infer<typeof checkoutAddressSchema>;
