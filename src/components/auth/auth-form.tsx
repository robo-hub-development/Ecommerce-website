"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginDetails, RegisterDetails } from "@/components/auth/details-step";
import { OtpStep } from "@/components/auth/otp-step";
import type { OtpPurpose, SendOtpInput } from "@/types/user";

const COPY = {
  login: {
    title: "Log in",
    intro: "Enter your email and we'll send you a one-time code. No password needed.",
    switchPrompt: "New to Stem Robo Hub?",
    switchLabel: "Create an account",
    switchPath: "/register",
  },
  register: {
    title: "Create your account",
    intro: "Tell us a bit about you and we'll verify your email with a one-time code.",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    switchPath: "/login",
  },
} satisfies Record<OtpPurpose, object>;

interface AuthFormProps {
  mode: OtpPurpose;
  /** Where to go after signing in (already validated by the page, re-validated before use). */
  next?: string;
}

/** Two steps: collect details and send the code, then verify the code. */
export function AuthForm({ mode, next }: AuthFormProps) {
  const [request, setRequest] = useState<SendOtpInput | null>(null);
  const copy = COPY[mode];
  const switchHref = next ? `${copy.switchPath}?next=${encodeURIComponent(next)}` : copy.switchPath;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h2">{request ? "Verify your email" : copy.title}</h1>
        {!request && <p className="text-muted-foreground">{copy.intro}</p>}
      </div>

      {request ? (
        <OtpStep request={request} next={next} onChangeDetails={() => setRequest(null)} />
      ) : mode === "login" ? (
        <LoginDetails onCodeSent={setRequest} />
      ) : (
        <RegisterDetails onCodeSent={setRequest} />
      )}

      <p className="text-center text-sm text-muted-foreground">
        {copy.switchPrompt}{" "}
        <Link href={switchHref} className="font-medium text-primary underline-offset-4 hover:underline">
          {copy.switchLabel}
        </Link>
      </p>
    </div>
  );
}
