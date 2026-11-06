"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AttachmentPicker } from "@/components/account/attachment-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { requestReturn } from "@/lib/api/orders";
import { returnSchema, type ReturnValues } from "@/lib/validations/return";
import { RETURN_REASONS, type ReturnReason } from "@/types/order";

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm";

export function ReturnForm({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReturnValues>({ resolver: zodResolver(returnSchema), defaultValues: { reason: "", description: "" } });

  const { mutate, isPending, error: submitError } = useMutation({
    mutationFn: (values: ReturnValues) =>
      requestReturn(orderId, { reason: values.reason as ReturnReason, description: values.description, files }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Return request submitted.");
      router.push(`/account/orders/${orderId}`);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field === "reason" || field === "description") setError(field, { message });
        }
      }
    },
  });

  const hasFieldErrors = submitError instanceof ApiError && Object.keys(submitError.fieldErrors).length > 0;

  return (
    <form
      onSubmit={handleSubmit((values) => mutate(values))}
      noValidate
      className="flex max-w-xl flex-col gap-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6"
    >
      <p className="text-sm text-muted-foreground">
        Order <strong className="text-foreground">{orderNumber}</strong>. Tell us what went wrong and attach photos or a short video if you can.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="return-reason">Reason</Label>
        <select
          id="return-reason"
          aria-invalid={!!errors.reason}
          aria-describedby={errors.reason ? "return-reason-error" : undefined}
          className={SELECT_CLASS}
          {...register("reason")}
        >
          <option value="" disabled>
            Select a reason
          </option>
          {RETURN_REASONS.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {reason.label}
            </option>
          ))}
        </select>
        {errors.reason && (
          <p id="return-reason-error" role="alert" className="text-sm text-destructive">
            {errors.reason.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="return-description">Description</Label>
        <Textarea
          id="return-description"
          rows={4}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "return-description-error" : undefined}
          {...register("description")}
        />
        {errors.description && (
          <p id="return-description-error" role="alert" className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="return-files">Photos or videos (optional)</Label>
        <AttachmentPicker files={files} onChange={setFiles} onReject={setFileErrors} />
        {fileErrors.map((message) => (
          <p key={message} role="alert" className="text-sm text-destructive">
            {message}
          </p>
        ))}
      </div>

      {submitError && !hasFieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {submitError.message || "Couldn't submit your request. Please try again."}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit request"}
        </Button>
        <Link href={`/account/orders/${orderId}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
