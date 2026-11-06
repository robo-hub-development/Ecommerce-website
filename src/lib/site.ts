import { site } from "@/config/site";
import { env } from "@/lib/env";

export const siteConfig = {
  name: site.name,
  shortName: site.shortName,
  tagline: "Robotics kits, drones, Arduino and sensors for makers and engineers.",
  social: {
    youtube: env.youtubeChannelUrl,
    instagram: env.instagramUrl,
  },
};

export const primaryNav = [
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks = {
  Shop: [
    { label: "All products", href: "/products" },
    { label: "New arrivals", href: "/products?sort=newest" },
    { label: "Best sellers", href: "/products?sort=bestselling" },
  ],
  Company: [
    { label: "About us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Videos", href: "/videos" },
    { label: "Instagram", href: "/instagram" },
  ],
  Policies: [
    { label: "Privacy Policy & Terms", href: "/privacy-policy-terms" },
    { label: "Shipping, Returns & Refunds", href: "/shipping-returns-refunds" },
  ],
  Support: [
    { label: "My orders", href: "/account/orders" },
    { label: "Cart", href: "/cart" },
    { label: "Login", href: "/login" },
  ],
};
