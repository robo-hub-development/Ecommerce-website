import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { CartButton } from "@/components/layout/cart-button";
import { HeaderSearch } from "@/components/layout/header-search";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { getCategories } from "@/lib/api/categories";
import { primaryNav } from "@/lib/site";
import  logo  from "../../../public/logo.svg";

export async function SiteHeader() {
  const categories = await getCategories().catch(() => []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {/* <div className="dark bg-background py-2 text-center text-xs text-muted-foreground">
        Free shipping on orders above ₹2,999
        <span className="hidden sm:inline"> · Genuine products with warranty</span>
      </div> */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container-page flex flex-wrap items-center gap-x-2 gap-y-3 py-3 lg:flex-nowrap lg:gap-x-4">
          <MobileMenu categories={categories} />
          <Logo logo={logo}/>

          <nav aria-label="Main" className="ml-2 hidden items-center lg:flex">
            <MegaMenu categories={categories} />
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:order-last">
            <AccountMenu />
            <CartButton />
          </div>

          <HeaderSearch className="order-last w-full lg:order-none lg:ml-auto lg:max-w-sm lg:flex-1" />
        </div>
      </header>
    </>
  );
}
