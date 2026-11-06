import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { site } from "@/config/site";

interface InfoCard {
  Icon: LucideIcon;
  title: string;
  text: string;
  href?: string;
  linkLabel?: string;
}

const cards: InfoCard[] = [
  { Icon: MapPin, title: "Store Address", text: site.address },
  { Icon: Phone, title: "Store Number", text: site.phone, href: site.phoneHref, linkLabel: `Call ${site.phone}` },
  { Icon: Mail, title: "Store Email", text: site.email, href: site.emailHref, linkLabel: `Email ${site.email}` },
];

export function ContactInfoCards() {
  return (
    <ul className="flex flex-col gap-4">
      {cards.map(({ Icon, title, text, href, linkLabel }) => (
        <li key={title} className="flex gap-4 rounded-xl bg-card p-5 shadow-card ring-1 ring-foreground/10">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-base font-semibold">{title}</h2>
            {href ? (
              <a href={href} aria-label={linkLabel} className="break-words text-muted-foreground hover:text-primary hover:underline">
                {text}
              </a>
            ) : (
              <address className="not-italic text-muted-foreground">{text}</address>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
