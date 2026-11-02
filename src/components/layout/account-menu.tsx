"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, LogOut, Package, User, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSessionSync } from "@/hooks/use-session-sync";
import { logout as endSession } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

export function AccountMenu() {
  const hydrated = useHydrated();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.logout);
  const router = useRouter();
  const currentUser = hydrated ? user : null;
  useSessionSync(currentUser !== null);

  const handleLogout = async () => {
    try {
      await endSession();
    } catch {
      toast.error("Couldn't reach the server. You've been signed out on this device.");
    }
    clearUser();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={currentUser ? `Account menu for ${currentUser.name}` : "Account menu"}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <User aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {currentUser ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="truncate">
                {currentUser.name}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/account" />}>
              <User aria-hidden /> My account
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/account/orders" />}>
              <Package aria-hidden /> My orders
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut aria-hidden /> Log out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem render={<Link href="/login" />}>
              <LogIn aria-hidden /> Log in
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/register" />}>
              <UserPlus aria-hidden /> Create account
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
