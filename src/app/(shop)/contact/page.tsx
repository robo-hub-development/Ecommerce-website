import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfoCards } from "@/components/contact/contact-info-cards";
import { MapSection } from "@/components/contact/map-section";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/config/site";
import { breadcrumbSchema, buildMetadata, organizationSchema } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "Contact Us";
const DESCRIPTION = `Reach ${site.name} by phone, email or visit our store in Dhamtari, Chhattisgarh. Send us a message and we will get back to you.`;

export const generateMetadata = (): Metadata =>
  buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/contact" });

export default function ContactPage() {
  return (
    <div className="container-page flex flex-col gap-10 py-8 lg:gap-12 lg:py-12">
      <JsonLd data={organizationSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <h1 className="text-h1">Get In Touch With Us!</h1>
        <p className="max-w-2xl text-muted-foreground">
          Questions about a kit, an order or a bulk requirement? Call, email or send us a message.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:gap-12">
        <ContactInfoCards />
        <section aria-labelledby="form-title" className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-foreground/10 sm:p-8">
          <h2 id="form-title" className="text-h2 mb-6">
            Send us a message
          </h2>
          <ContactForm />
        </section>
      </div>

      <MapSection />
    </div>
  );
}
