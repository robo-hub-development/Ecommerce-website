"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCountdown } from "@/hooks/use-countdown";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { OTP_LENGTH, OTP_RESEND_SECONDS } from "@/lib/auth/constants";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { env } from "@/lib/env";
import { otpSchema, type OtpValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/auth";
import type { SendOtpInput } from "@/types/user";

interface OtpStepProps {
  /** The details the code was requested with; reused to resend. */
  request: SendOtpInput;
  next?: string;
  onChangeDetails: () => void;
}

const formatTimer = (seconds: number) => `0:${String(seconds).padStart(2, "0")}`;

export function OtpStep({ request, next, onChangeDetails }: OtpStepProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const inputRef = useRef<HTMLInputElement>(null);
  const { remaining, restart } = useCountdown(OTP_RESEND_SECONDS);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<OtpValues>({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });

  const resetCode = () => {
    setValue("otp", "");
    inputRef.current?.focus();
  };

  const verify = useMutation({
    mutationFn: ({ otp }: OtpValues) => verifyOtp({ purpose: request.purpose, email: request.email, otp }),
    onSuccess: (user) => {
      setUser(user);
      toast.success(request.purpose === "register" ? "Account created. Welcome!" : "Welcome back!");
      router.replace(safeRedirectPath(next));
      router.refresh();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? (error.fieldErrors.otp ?? error.message)
          : "Couldn't verify the code. Please try again.";
      setError("otp", { message });
      resetCode();
    },
  });

  const resend = useMutation({
    mutationFn: () => sendOtp(request),
    onSuccess: () => {
      restart();
      clearErrors("otp");
      resetCode();
      toast.success("A new code is on its way");
    },
    onError: (error) =>
      setError("otp", {
        message: error instanceof ApiError ? error.message : "Couldn't resend the code. Please try again.",
      }),
  });

  const busy = verify.isPending;
  const error = errors.otp?.message;
  const submit = handleSubmit((values) => verify.mutate(values));

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p id="otp-instructions" className="text-sm text-muted-foreground">
          Enter the {OTP_LENGTH}-digit code we sent to <span className="font-medium text-foreground">{request.email}</span>.
        </p>
        {env.useMocks && (
          <p className="text-xs text-muted-foreground">Demo mode: any account uses the code 123456.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <InputOTP
              ref={inputRef}
              maxLength={OTP_LENGTH}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              disabled={busy}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                if (error) clearErrors("otp");
              }}
              onComplete={() => void submit()}
              aria-label={`${OTP_LENGTH}-digit verification code`}
              aria-describedby="otp-instructions"
              aria-invalid={!!error}
            >
              <InputOTPGroup>
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                  <InputOTPSlot key={index} index={index} invalid={!!error} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={busy}>
        {busy && <Loader2 className="animate-spin" aria-hidden data-icon="inline-start" />}
        {busy ? "Verifying..." : "Verify and continue"}
      </Button>

      <div className="flex flex-col items-center gap-1 text-sm">
        {remaining > 0 ? (
          <p className="text-muted-foreground" aria-live="off">
            Resend code in <span className="font-medium tabular-nums text-foreground">{formatTimer(remaining)}</span>
          </p>
        ) : (
          <Button
            type="button"
            variant="link"
            onClick={() => resend.mutate()}
            disabled={resend.isPending || busy}
          >
            {resend.isPending ? "Sending..." : "Resend code"}
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onChangeDetails} disabled={busy}>
          Change {request.purpose === "register" ? "details" : "email"}
        </Button>
      </div>
    </form>
  );
}
