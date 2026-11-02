import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Cpu, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/lib/env";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ColorSwatch } from "./_components/color-swatch";
import { DsSection } from "./_components/ds-section";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const COLORS = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["card", "bg-card"],
  ["primary", "bg-primary"],
  ["primary-soft", "bg-primary-soft"],
  ["cyan", "bg-cyan"],
  ["secondary", "bg-secondary"],
  ["muted", "bg-muted"],
  ["accent", "bg-accent"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["destructive", "bg-destructive"],
  ["border", "bg-border"],
  ["foreground", "bg-foreground"],
] as const;

const TYPE_SCALE = [
  ["text-display", "Display — Build robots"],
  ["text-h1", "Heading 1 — Robotic arms"],
  ["text-h2", "Heading 2 — Featured kits"],
  ["text-h3", "Heading 3 — Product details"],
  ["text-lead", "Lead — A larger intro paragraph for key sections."],
  ["text-base", "Body — Standard paragraph text for descriptions and content."],
  ["text-sm", "Small — Secondary information and captions."],
] as const;

const SHADOWS = [
  "shadow-card",
  "shadow-card-hover",
  "shadow-pop",
  "shadow-glow",
] as const;

export default function DesignSystemPage() {
  if (env.isProduction) notFound();

  return (
    <main className="container-page flex flex-col gap-16 py-12 lg:py-16">
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-primary uppercase">Stem Robo Hub</p>
        <h1 className="text-h1">Design system</h1>
        <p className="max-w-2xl text-lead text-muted-foreground">
          Tokens and components used across the storefront. Development only.
        </p>
      </header>

      <DsSection
        id="colors"
        title="Colors"
        description="Semantic tokens defined in globals.css."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {COLORS.map(([name, className]) => (
            <ColorSwatch key={name} name={name} className={className} />
          ))}
        </div>
        <div className="dark rounded-2xl bg-background p-6 text-foreground">
          <p className="text-eyebrow text-primary uppercase">Dark section</p>
          <p className="mt-2 text-h3">
            Scoped with the `dark` class for hero and footer.
          </p>
          <p className="mt-1 text-muted-foreground">
            Tokens remap automatically inside it.
          </p>
        </div>
      </DsSection>

      <DsSection
        id="typography"
        title="Typography"
        description="Inter, with a fluid scale for headings."
      >
        <div className="flex flex-col gap-4">
          {TYPE_SCALE.map(([className, sample]) => (
            <div
              key={className}
              className="flex flex-col gap-1 border-b pb-4 last:border-b-0"
            >
              <span className="font-mono text-xs text-muted-foreground">{className}</span>
              <p className={className}>{sample}</p>
            </div>
          ))}
        </div>
      </DsSection>

      <DsSection
        id="buttons"
        title="Buttons"
        description="Variants, sizes and states. Minimum 40px tall for touch."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">
            Large <ArrowRight data-icon="inline-end" />
          </Button>
          <Button>
            <ShoppingCart data-icon="inline-start" /> Add to cart
          </Button>
          <Button size="icon" variant="outline" aria-label="Open cart">
            <ShoppingCart />
          </Button>
        </div>
      </DsSection>

      <DsSection
        id="inputs"
        title="Inputs"
        description="Always paired with a visible label."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ds-name">Full name</Label>
            <Input id="ds-name" placeholder="Ada Lovelace" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ds-email">Email</Label>
            <Input
              id="ds-email"
              type="email"
              defaultValue="not-an-email"
              aria-invalid
              aria-describedby="ds-email-error"
            />
            <p id="ds-email-error" className="text-sm text-destructive">
              Enter a valid email address.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ds-disabled">Disabled</Label>
            <Input id="ds-disabled" disabled placeholder="Unavailable" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ds-note">Order note</Label>
            <Textarea id="ds-note" placeholder="Delivery instructions" />
          </div>
        </div>
      </DsSection>

      <DsSection id="badges" title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>New</Badge>
          <Badge variant="secondary">In stock</Badge>
          <Badge variant="outline">Robot Kits</Badge>
          <Badge variant="destructive">Out of stock</Badge>
        </div>
      </DsSection>

      <DsSection
        id="cards"
        title="Cards"
        description="One card style: border ring, soft shadow, lift on hover."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <Cpu className="mb-2 size-6 text-primary" aria-hidden />
              <CardTitle className="text-h3">Feature card</CardTitle>
              <CardDescription>
                Short supporting copy that explains the benefit.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <Image
              src="/images/kits.svg"
              alt="Product placeholder"
              width={400}
              height={400}
              sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
              className="aspect-square w-full object-cover"
            />
            <CardContent className="flex flex-col gap-2">
              <Badge variant="secondary" className="w-fit">
                Robot Kits
              </Badge>
              <p className="text-h3">Atlas Rover Kit</p>
              <p className="font-semibold">₹18,999</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SHADOWS.map((shadow) => (
            <div key={shadow} className={`rounded-xl bg-card p-4 ${shadow}`}>
              <span className="font-mono text-xs text-muted-foreground">{shadow}</span>
            </div>
          ))}
        </div>
      </DsSection>

      <DsSection
        id="skeletons"
        title="Skeletons"
        description="Shown while data loads; match the final layout."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <Card>
            <Skeleton className="aspect-square w-full rounded-none" />
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-5 w-1/4" />
            </CardContent>
          </Card>
        </div>
      </DsSection>
    </main>
  );
}
