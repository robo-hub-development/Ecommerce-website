"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/auth/text-field";
import { Button } from "@/components/ui/button";
import { checkoutAddressSchema, type CheckoutAddressValues } from "@/lib/validations/checkout";

interface AddressFormProps {
  defaultValues: CheckoutAddressValues;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (values: CheckoutAddressValues) => void;
  onCancel?: () => void;
}

type BlockErrors = Partial<Record<"line1" | "landmark" | "pincode" | "state" | "city", { message?: string }>>;

/** Street fields shared by the shipping and billing blocks; `prefix` points react-hook-form at the right object. */
function AddressFields({
  prefix,
  register,
  errors,
  autoCompletePrefix,
}: {
  prefix: "" | "billing.";
  register: ReturnType<typeof useForm<CheckoutAddressValues>>["register"];
  errors: BlockErrors | undefined;
  autoCompletePrefix: "shipping" | "billing";
}) {
  const field = (name: "line1" | "landmark" | "pincode" | "state" | "city") =>
    `${prefix}${name}` as "line1" | "landmark" | "pincode" | "state" | "city";
  return (
    <>
      <TextField
        label="Address"
        autoComplete={`${autoCompletePrefix} address-line1`}
        error={errors?.line1?.message}
        {...register(field("line1"))}
      />
      <TextField
        label="Landmark (optional)"
        autoComplete={`${autoCompletePrefix} address-line2`}
        error={errors?.landmark?.message}
        {...register(field("landmark"))}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Pincode"
          inputMode="numeric"
          maxLength={6}
          autoComplete={`${autoCompletePrefix} postal-code`}
          error={errors?.pincode?.message}
          {...register(field("pincode"))}
        />
        <TextField
          label="City"
          autoComplete={`${autoCompletePrefix} address-level2`}
          error={errors?.city?.message}
          {...register(field("city"))}
        />
        <TextField
          label="State"
          autoComplete={`${autoCompletePrefix} address-level1`}
          error={errors?.state?.message}
          {...register(field("state"))}
        />
      </div>
    </>
  );
}

export function AddressForm({ defaultValues, submitLabel, disabled, onSubmit, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutAddressValues>({ resolver: zodResolver(checkoutAddressSchema), defaultValues });
  const billingSame = watch("billingSameAsShipping");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
        <TextField
          label="Contact number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel-national"
          error={errors.mobile?.message}
          {...register("mobile")}
        />
      </div>
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-sm font-semibold">Shipping address</legend>
        <AddressFields prefix="" register={register} errors={errors} autoCompletePrefix="shipping" />
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--primary)]" {...register("billingSameAsShipping")} />
        Billing address is the same as shipping
      </label>

      {!billingSame && (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-sm font-semibold">Billing address</legend>
          <AddressFields prefix="billing." register={register} errors={errors.billing} autoCompletePrefix="billing" />
        </fieldset>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={disabled}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
