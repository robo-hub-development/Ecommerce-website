import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedArticles } from "@/components/home/featured-articles";
import { HeroSection, HeroSkeleton } from "@/components/home/hero-section";
import { InstagramSection } from "@/components/home/instagram-section";
import { ProductShowcase } from "@/components/home/product-showcase";
import { YoutubeSection } from "@/components/home/youtube-section";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 600;

const title = "Robotics Kits, Drones, Arduino & Sensors";
const description =
  "Shop robot kits, drones, Arduino and ESP32 boards, sensors and robotic arms. Genuine products, fast shipping and build guides from the Stem Robo Hub team.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", siteName: siteConfig.name, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Stem Robo Hub: robotics kits, drones, Arduino and sensors</h1>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <CategoryGrid />
      <ProductShowcase
        id="new-arrivals-title"
        tone="surface"
        eyebrow="Just landed"
        title="New arrivals"
        description="The latest kits, boards and sensors added to the store."
        viewAllHref="/products?sort=newest"
        query={{ sort: "newest", pageSize: 4 }}
      />
      <ProductShowcase
        id="best-sellers-title"
        eyebrow="Customer favourites"
        title="Best-selling products"
        description="What makers and engineers are buying most."
        viewAllHref="/products?sort=bestselling"
        query={{ sort: "bestselling", pageSize: 4 }}
      />
      <FeaturedArticles />
      <YoutubeSection />
      <InstagramSection />
      <JsonLd data={organizationSchema()} />
    </>
  );
}
