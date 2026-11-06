import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";

const rows = [
  { Icon: MapPin, label: "Address", text: site.address },
  { Icon: Phone, label: "Phone", text: site.phone, href: site.phoneHref },
  { Icon: Mail, label: "Email", text: site.email, href: site.emailHref },
];

export function CompanyInfo() {
  return (
    <section aria-labelledby="company-info-title" className="rounded-2xl bg-surface p-6 ring-1 ring-foreground/10 sm:p-8">
      <h2 id="company-info-title" className="text-h2">
        Company information
      </h2>
      <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">Registered name</dt>
          <dd className="mt-1 font-semibold">{site.name}</dd>
        </div>
        {rows.map(({ Icon, label, text, href }) => (
          <div key={label}>
            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon className="size-4" aria-hidden />
              {label}
            </dt>
            <dd className="mt-1 font-semibold">
              {href ? (
                <a href={href} className="hover:text-primary hover:underline">
                  {text}
                </a>
              ) : (
                text
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
