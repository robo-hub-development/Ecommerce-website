"use client";

import { useId } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { TextField } from "@/components/auth/text-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/api/contact";
import { ApiError } from "@/lib/api/client";
import { contactSchema, type ContactValues } from "@/lib/validations/contact";

export function ContactForm() {
  const messageId = useId();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: { website: "" } });

  const { mutate, isPending, isSuccess, error, reset: resetMutation } = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => reset(),
    onError: (err) => {
      if (!(err instanceof ApiError)) return;
      for (const [field, message] of Object.entries(err.fieldErrors)) {
        if (field in contactSchema.shape) setError(field as keyof ContactValues, { message });
      }
    },
  });

  if (isSuccess) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-xl bg-primary-soft p-6">
        <CheckCircle2 className="size-8 text-primary" aria-hidden />
        <div>
          <p className="text-lg font-semibold">Thanks, your message is on its way.</p>
          <p className="text-muted-foreground">We usually reply within one working day.</p>
        </div>
        <Button variant="outline" onClick={() => resetMutation()}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))} noValidate className="flex flex-col gap-5">
      {/* Honeypot: off-screen and skipped by keyboard and screen readers; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <TextField
          label="Phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          hint="10-digit mobile number"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={messageId}>Message</Label>
        <Textarea
          id={messageId}
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
          {...register("message")}
        />
        {errors.message && (
          <p id={`${messageId}-error`} role="alert" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error instanceof ApiError && error.status < 500 && error.status !== 0
            ? error.message
            : "We couldn't send your message right now. Please try again or call us."}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="h-11 w-fit">
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
