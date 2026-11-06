"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { getSession } from "@/lib/api/auth";

export function ProfileCard() {
  const { data: user, isPending, isError, refetch } = useQuery({ queryKey: ["session"], queryFn: getSession, retry: false });

  if (isPending) {
    return (
      <div aria-busy="true" aria-label="Loading profile" className="flex flex-col gap-4 rounded-xl p-6 ring-1 ring-foreground/10">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3">
        <StateMessage variant="error" title="Couldn't load your profile" className="w-full" />
        <button type="button" onClick={() => refetch()} className="text-sm font-medium text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const rows = [
    { Icon: User, label: "Name", value: user.name },
    { Icon: Mail, label: "Email", value: user.email },
    { Icon: Phone, label: "Mobile", value: user.mobile },
  ];
  return (
    <section aria-labelledby="profile-heading" className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <h2 id="profile-heading" className="mb-4 text-h3">
        Profile details
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium break-all">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
