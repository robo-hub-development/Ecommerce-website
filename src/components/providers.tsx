"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );

  // Covers every way of signing out (menu, expired session): the next account never sees this one's cart.
  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (previous.user && !state.user) {
          queryClient.removeQueries({ queryKey: ["cart"] });
          // A cached session would be written back into the store when the header remounts, undoing the logout.
          queryClient.removeQueries({ queryKey: ["session"] });
        }
      }),
    [queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
