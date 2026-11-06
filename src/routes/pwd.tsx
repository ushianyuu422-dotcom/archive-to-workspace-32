import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Contrast, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { PWD_BENEFITS, PWD_GUIDES } from "@/lib/content";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/pwd")({
  head: () => ({
    meta: [
      { title: `PWD Portal — ${SITE.name}` },
      { name: "description", content: "Step-by-step PWD guides, services and benefits, and accessibility tools for residents of Wawa, Taguig City." },
      { property: "og:title", content: `PWD Portal — ${SITE.name}` },
      { property: "og:description", content: "How to get a PWD ID, avail benefits, and request assistance from the barangay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PwdPage,
});

function PwdPage() {
  const [hc, setHc] = useState(false);
  const [size, setSize] = useState<"base" | "lg" | "xl">("base");

  const applyClasses = (highContrast: boolean, textSize: "base" | "lg" | "xl") => {
    const root = document.documentElement;
    root.classList.toggle("hc", highContrast);
    root.classList.remove("textsize-lg", "textsize-xl");
    if (textSize === "lg") root.classList.add("textsize-lg");
    if (textSize === "xl") root.classList.add("textsize-xl");
  };

  return (
    <div>
      <PageHero
        kicker="Accessibility first"
        title="PWD Portal"
        body="Guides, benefits, and assistance for persons with disabilities in Barangay Wawa — plus reading tools for this site."
      >
        <div
          role="group"
          aria-label="Accessibility toolbar"
          className="flex flex-wrap items-center gap-2"
        >
          <Button
            variant={hc ? "gold" : "outline"}
            size="sm"
            className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
            aria-pressed={hc}
            onClick={() => {
              setHc(!hc);
              applyClasses(!hc, size);
            }}
          >
            <Contrast className="size-4" aria-hidden /> High contrast
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
            aria-label="Increase text size"
            onClick={() => {
              const next = size === "base" ? "lg" : "xl";
              setSize(next);
              applyClasses(hc, next);
            }}
          >
            <ZoomIn className="size-4" aria-hidden /> Bigger text
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
            aria-label="Reset text size"
            disabled={size === "base"}
            onClick={() => {
              setSize("base");
              applyClasses(hc, "base");
            }}
          >
            <ZoomOut className="size-4" aria-hidden /> Reset
          </Button>
        </div>
      </PageHero>

      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl font-semibold text-forest-deep">Step-by-step guides</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {PWD_GUIDES.map((g) => (
            <Card key={g.title}>
              <CardHeader>
                <CardTitle className="font-display text-lg text-forest-deep">{g.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  {g.steps.map((s, i) => (
                    <li key={s} className="flex gap-2">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-forest">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="paper-texture-cream">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl font-semibold text-forest-deep">Services and benefits</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PWD_BENEFITS.map((b) => (
              <li key={b.title} className="rounded-lg border border-border bg-card p-4">
                <p className="flex items-start gap-2 font-display text-base font-semibold text-forest-deep">
                  <Check className="mt-1 size-4 shrink-0 text-gold-deep" aria-hidden />
                  {b.title}
                </p>
                <p className="mt-1 pl-6 text-sm text-muted-foreground">{b.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-forest-deep">Need help?</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Visit the barangay hall ({SITE.officeHours}) or{" "}
            <Link to="/contact" className="font-medium text-gold-deep hover:underline">
              contact us
            </Link>{" "}
            and ask for the PWD focal person. Online inquiry forms are coming to this portal soon.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
