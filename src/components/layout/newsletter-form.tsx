"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/api/content";
import { newsletterSchema, type NewsletterValues } from "@/lib/validations/newsletter";

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterValues>({ resolver: zodResolver(newsletterSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email }: NewsletterValues) => subscribeToNewsletter(email),
    onSuccess: () => {
      toast.success("You're subscribed. Welcome to Stem Robo Hub!");
      reset();
    },
    onError: () => toast.error("Couldn't subscribe right now. Please try again."),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutate(values))}
      noValidate
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "newsletter-error" : undefined}
          className="h-11 flex-1"
          {...register("email")}
        />
        <Button type="submit" size="lg" disabled={isPending} className="h-11">
          {isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      {errors.email && (
        <p id="newsletter-error" role="alert" className="text-sm text-destructive">
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
