"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { TextField } from "@/components/auth/text-field";
import { Button } from "@/components/ui/button";
import { sendOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validations/auth";
import type { SendOtpInput } from "@/types/user";

interface DetailsStepProps {
  onCodeSent: (request: SendOtpInput) => void;
}

/** Requests the code, then shows server-side field errors (e.g. "already registered") under the right input. */
function useSendCode<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: Path<T>[],
  build: (values: T) => SendOtpInput,
  onCodeSent: (request: SendOtpInput) => void,
) {
  return useMutation({
    mutationFn: async (values: T) => {
      const request = build(values);
      await sendOtp(request);
      return request;
    },
    onSuccess: onCodeSent,
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        setError("root", { message: "Something went wrong. Please try again." });
        return;
      }
      const matched = fields.filter((field) => error.fieldErrors[field]);
      for (const field of matched) setError(field, { message: error.fieldErrors[field] });
      if (matched.length === 0) {
        const unreachable = error.status === 0 || error.status >= 500;
        setError("root", {
          message: unreachable ? "We couldn't reach the server. Please try again." : error.message,
        });
      }
    },
  });
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending && <Loader2 className="animate-spin" aria-hidden data-icon="inline-start" />}
      {pending ? "Sending code..." : "Send verification code"}
    </Button>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </p>
  );
}

export function LoginDetails({ onCodeSent }: DetailsStepProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "" } });

  const send = useSendCode(setError, ["email"], ({ email }) => ({ purpose: "login", email }), onCodeSent);

  return (
    <form onSubmit={handleSubmit((values) => send.mutate(values))} noValidate className="flex flex-col gap-5">
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormError message={errors.root?.message} />
      <SubmitButton pending={send.isPending} />
    </form>
  );
}

export function RegisterDetails({ onCodeSent }: DetailsStepProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", mobile: "", email: "" },
  });

  const send = useSendCode(
    setError,
    ["name", "mobile", "email"],
    (values) => ({ purpose: "register", ...values }),
    onCodeSent,
  );

  return (
    <form onSubmit={handleSubmit((values) => send.mutate(values))} noValidate className="flex flex-col gap-5">
      <TextField
        label="Full name"
        autoComplete="name"
        autoFocus
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        hint="10-digit Indian mobile number"
        error={errors.mobile?.message}
        {...register("mobile")}
      />
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormError message={errors.root?.message} />
      <SubmitButton pending={send.isPending} />
    </form>
  );
}
