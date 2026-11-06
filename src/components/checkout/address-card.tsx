import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckoutAddressValues } from "@/lib/validations/checkout";

interface AddressCardProps {
  address: CheckoutAddressValues;
  disabled?: boolean;
  onEdit: () => void;
}

/** The saved delivery address with an Edit action. */
export function AddressCard({ address, disabled, onEdit }: AddressCardProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-3">
        <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <address className="text-sm not-italic leading-relaxed">
          <p className="font-semibold">{address.fullName}</p>
          <p className="text-muted-foreground">{address.mobile}</p>
          <p>
            {address.line1}
            {address.landmark && `, ${address.landmark}`}
          </p>
          <p>
            {address.city}, {address.state} {address.pincode}
          </p>
        </address>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onEdit} disabled={disabled}>
        Change
      </Button>
    </div>
  );
}
