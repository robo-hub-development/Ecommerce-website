import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { footerLinks, siteConfig } from "@/lib/site";

const socials = [
  { label: "Stem Robo Hub on YouTube", href: siteConfig.social.youtube, Icon: YoutubeIcon },
  {
    label: "Stem Robo Hub on Instagram",
    href: siteConfig.social.instagram,
    Icon: InstagramIcon,
  },
];

const contacts = [
  { Icon: Mail, text: siteConfig.email, href: `mailto:${siteConfig.email}` },
  {
    Icon: Phone,
    text: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\s/g, "")}`,
  },
  { Icon: MapPin, text: siteConfig.address },
];

export function SiteFooter() {
  return (
    <footer className="dark bg-background text-foreground">
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1.4fr_2fr] lg:py-16">
        <div className="flex flex-col gap-5">
          <Logo />
          <p className="max-w-sm text-muted-foreground">{siteConfig.tagline}</p>
          <div className="max-w-md">
            <p className="mb-2 font-semibold">
              Get build guides and offers in your inbox
            </p>
            <NewsletterForm />
          </div>
          <ul className="flex gap-2">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h2 className="mb-4 text-sm font-semibold">{title}</h2>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="sm:col-span-3">
            <h2 className="mb-4 text-sm font-semibold">Contact</h2>
            <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {contacts.map(({ Icon, text, href }) => (
                <li key={text} className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {href ? (
                    <a href={href} className="hover:text-foreground">
                      {text}
                    </a>
                  ) : (
                    <span>{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="container-page py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
