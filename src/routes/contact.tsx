import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { FAQS } from "@/lib/content";
import { HOTLINES, SITE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact Us — ${SITE.name}` },
      { name: "description", content: "Reach Barangay Wawa, Taguig City: address, office hours, hotlines, and answers to common questions." },
      { property: "og:title", content: `Contact Us — ${SITE.name}` },
      { property: "og:description", content: "Address, office hours, hotlines, and FAQ for Barangay Wawa, Taguig City." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div>
      <PageHero
        kicker="We're here to help"
        title="Contact Us"
        body={`Visit the barangay hall or reach us through the numbers and channels below. ${SITE.officeHours}.`}
      />

      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
              {SITE.address}
            </p>
            <p className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
              {SITE.officeHours}
            </p>
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
              <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
            </p>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-display text-base font-semibold text-forest-deep">Emergency hotlines</p>
              <ul className="mt-2 divide-y divide-border">
                {[...HOTLINES.taguig, ...HOTLINES.national].map((h) => (
                  <li key={h.label} className="flex items-center justify-between gap-3 py-2">
                    <span>{h.label}</span>
                    <a
                      href={`tel:${h.number.replace(/[^0-9+]/g, "")}`}
                      className="rounded-md bg-secondary px-2.5 py-1 font-semibold text-forest hover:bg-accent/40"
                    >
                      {h.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <iframe
            title={`Map showing ${SITE.address}`}
            src="https://www.google.com/maps?q=Wawa,+Taguig,+Metro+Manila&output=embed"
            className="h-96 w-full rounded-xl border border-border"
            loading="lazy"
          />
        </div>
      </Reveal>

      <Reveal as="section" className="paper-texture-cream">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="font-display text-2xl font-semibold text-forest-deep">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`c-faq-${i}`}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-6 text-sm text-muted-foreground">
            Need to follow up on a filed request?{" "}
            <Link to="/track" className="font-medium text-gold-deep hover:underline">
              Track it here
            </Link>
            .
          </p>
        </div>
      </Reveal>
    </div>
  );
}
