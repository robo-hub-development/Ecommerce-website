# Stem Robo Hub Frontend

## Stack
Next.js 15 App Router, TypeScript (strict), Tailwind CSS, shadcn/ui, lucide-react, Framer Motion (subtle), TanStack Query, Zustand (with persist for cart), React Hook Form + Zod, input-otp, Embla Carousel, sonner, MSW, pnpm. No Redux.

## UI / Design rules (HIGHEST PRIORITY)
- Professional, premium, clean tech/robotics brand look. Think modern DTC electronics store, not a template.
- Define a design system first: color tokens (CSS variables), typography scale, spacing, radius, shadows. Primary accent: electric blue/cyan on a neutral base; support light theme, with dark sections for hero/footer.
- Font: Inter or Geist via next/font. Consistent 8px spacing grid. Max content width 1280px.
- Generous whitespace, clear visual hierarchy, consistent card style, subtle hover/focus states, smooth but restrained animations (no flashy effects).
- Fully responsive, mobile-first (most traffic is mobile). Test layouts at 360, 768, 1024, 1440.
- Every data view needs loading skeletons, empty states, and error states. No blank screens.
- Accessible: semantic HTML, proper heading order, focus rings, aria labels, keyboard navigable, WCAG AA contrast.
- Reusable components only; no copy-pasted markup.

## SEO rules
- Public pages (home, products, product detail, category, blog, about, contact) are server-rendered with ISR (revalidate) using Server Components.
- generateMetadata for every public page (title, description, canonical, Open Graph, Twitter).
- JSON-LD: Product + Offer + BreadcrumbList on product pages, Article on blog, Organization on home.
- sitemap.ts and robots.ts. Cart, checkout, account, auth pages are noindex.
- next/image everywhere (explicit sizes, priority only for hero/LCP image), next/font, third-party scripts lazyOnload.
- Listing filters/sort/page live in URL query params. Use pagination (crawlable links), not pure infinite scroll.

## Code rules
- "use client" only for interactive components; keep pages as Server Components.
- API layer in src/lib/api (typed fetch wrapper, one file per domain). All types in src/types. Zod schemas in src/lib/validations.
- Env vars via .env.example; never hardcode URLs/keys.
- Folder structure: src/app/(shop), (auth), (account); src/components/{ui,layout,home,product,cart,checkout}; src/lib; src/hooks; src/store; src/mocks.
- Small files, clear naming, no unused code. Run `pnpm lint` and `pnpm build` after each phase and fix errors.

## Business rules
- Auth is OTP-based (no password). Register: name, mobile, email, OTP. Login: email, OTP.
- Cart: max 10 qty per product. COD allowed ONLY if cart has exactly 1 item with qty 1; otherwise disable COD at checkout and show the reason.
- Checkout: COD creates order immediately; online payment redirects to gateway and order is created after payment success. Handle success, failure, pending states.
- Account: orders with Call Us and Cancel (only if backend flag canCancel is true).
- YouTube and Instagram feeds are fetched server-side (never expose keys to client), cached with ISR.
