import type { Metadata } from "next";
import { AboutBlock } from "@/components/about/about-block";
import { CompanyInfo } from "@/components/about/company-info";
import { PageIntro } from "@/components/content/page-intro";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "About us",
  description: `${site.name} supplies robotics kits, Arduino and ESP32 boards, sensors and components from ${site.addressParts.city}, ${site.addressParts.region}.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-page flex flex-col gap-12 py-8 lg:gap-16 lg:py-12">
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title={`About ${site.shortName}`}
        description={`${site.name} is a robotics and STEM store based in ${site.addressParts.city}, ${site.addressParts.region}.`}
      />

      <AboutBlock
        id="intro-title"
        eyebrow="Who we are"
        title="Robotics and electronics for makers, students and engineers"
        image={{ src: "/images/wide-1.svg", alt: "Illustration of a robot kit on a workbench" }}
      >
        <p>
          We stock robot kits, drones, Arduino and ESP32 boards, sensors, motors and robotic arms, so you can find what you
          need to learn, build and prototype in one place.
        </p>
        <p>Every product page lists what is in the box, and our blog and videos show how to put it all together.</p>
      </AboutBlock>

      <div className="grid gap-8 md:grid-cols-2">
        <AboutBlock id="mission-title" eyebrow="Mission" title="Make hands-on STEM learning accessible">
          <p>Give learners and builders dependable components and clear guidance, so they spend time building rather than searching.</p>
        </AboutBlock>
        <AboutBlock id="vision-title" eyebrow="Vision" title="A community of confident builders">
          <p>Help more students and makers across India move from first experiments to real robotics projects.</p>
        </AboutBlock>
      </div>

      <AboutBlock
        id="story-title"
        eyebrow="Our story"
        title="From a local store to an online shop"
        image={{ src: "/images/wide-2.svg", alt: "Illustration of electronics components and tools" }}
        reverse
      >
        <p>
          {site.shortName} started as a store serving the {site.addressParts.city} community and now ships robotics supplies
          to customers online.
        </p>
        <p>We share what we learn through tutorials, comparisons and build videos on our blog, YouTube and Instagram.</p>
      </AboutBlock>

      <CompanyInfo />
    </div>
  );
}
