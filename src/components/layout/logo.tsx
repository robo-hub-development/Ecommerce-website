import Image, { type StaticImageData }  from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import defaultLogo from "../../../public/logo.svg";

type LogoProps = {
  logo?: string | StaticImageData;
};

export function Logo({ logo = defaultLogo }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className="flex shrink-0 items-center rounded-md"
    >
      <Image
        src={logo}
        alt=""
        priority height={35}
        />
        {/* sizes="(min-width: 1024px) 112px, 96px" */}
        {/* className="w-24 object-contain lg:h-14 lg:w-28" */}
    </Link>
  );
}