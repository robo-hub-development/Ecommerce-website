import { env } from "@/lib/env";

export const siteConfig = {
  name: "Stem Robo Hub",
  tagline: "Robotics kits, drones, Arduino and sensors for makers and engineers.",
  email: env.supportEmail,
  phone: env.supportPhone,
  address: "Plot 21, Tech Park Road, Bengaluru, Karnataka 560001",
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
  ],
  Support: [
    { label: "My orders", href: "/account/orders" },
    { label: "Cart", href: "/cart" },
    { label: "Login", href: "/login" },
  ],
};
