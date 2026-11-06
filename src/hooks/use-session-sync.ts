import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";

/**
 * The persisted user is only a UI hint; the httpOnly cookie is the real session.
 * If the shopper looks signed in, confirm with the server and drop the hint when the session has expired.
 */
export function useSessionSync(enabled: boolean) {
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);

  const { data, error } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (enabled && data) setUser(data);
  }, [enabled, data, setUser]);

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) logout();
  }, [error, logout]);
}
