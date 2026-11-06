import { Banknote, CreditCard, Info } from "lucide-react";
import type { CodEligibility } from "@/lib/cart-rules";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/order";

interface PaymentOptionsProps {
  value: PaymentMethod;
  cod: CodEligibility;
  disabled?: boolean;
  onChange: (method: PaymentMethod) => void;
}

function Option({
  id,
  icon: Icon,
  title,
  description,
  checked,
  disabled,
  onSelect,
}: {
  id: PaymentMethod;
  icon: typeof Banknote;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        checked ? "border-primary bg-primary-soft" : "hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
      )}
    >
      <input
        type="radio"
        name="payment-method"
        value={id}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="mt-1 size-4 accent-[var(--primary)]"
      />
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <span className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

/** COD is offered only when the cart rule allows it; otherwise it is disabled with the reason shown. */
export function PaymentOptions({ value, cod, disabled = false, onChange }: PaymentOptionsProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="sr-only">Payment method</legend>
      <Option
        id="online"
        icon={CreditCard}
        title="Pay online"
        description="UPI, cards, netbanking and wallets via Razorpay."
        checked={value === "online"}
        disabled={disabled}
        onSelect={() => onChange("online")}
      />
      <Option
        id="cod"
        icon={Banknote}
        title="Cash on delivery"
        description="Pay when your order arrives."
        checked={value === "cod"}
        disabled={disabled || !cod.eligible}
        onSelect={() => onChange("cod")}
      />
      {!cod.eligible && (
        <p role="status" className="flex gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          COD unavailable. {cod.reason}
        </p>
      )}
    </fieldset>
  );
}
