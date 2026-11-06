import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import { useLang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { BOOKING_SLOTS } from "@/lib/site";
import { FAQS, OFFICIALS, SERVICES } from "@/lib/content";
import heroAsset from "@/assets/hero-barangay.jpg";
import courtAsset from "@/assets/multipurp.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — Serbisyong tapat, para sa lahat` },
      { name: "description", content: "Barangay services, the PWD portal, and multi-purpose court booking for residents of Wawa, Taguig City." },
      { property: "og:title", content: "Barangay Wawa United — Taguig City" },
      { property: "og:description", content: "One platform for barangay services, the PWD portal, and the barangay court." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLang();

  return (
    <div>
      <PageHero
        kicker={t("hero.kicker")}
        title={t("hero.title")}
        body={t("hero.body")}
        imageSrc={heroAsset}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/court-booking" className="gap-2">
              <CalendarDays className="size-4" aria-hidden />
              {t("hero.book")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20">
            <Link to="/pwd">{t("hero.pwd")}</Link>
          </Button>
        </div>
      </PageHero>

      {/* today at the court */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
              {t("common.todayAtCourt")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-forest-deep">
              Multi-Purpose Court, Barangay Wawa
            </h2>
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
              {BOOKING_SLOTS.map((s) => (
                <li key={s.start} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="font-medium text-foreground">{s.label}</span>
                  <Badge variant="secondary">Open for booking</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Two-hour slots, walk-ins welcome when free.{" "}
              <Link to="/court-booking" className="font-medium text-gold-deep hover:underline">
                {t("common.viewAll")} →
              </Link>
            </p>
          </div>
          <img
            src={courtAsset}
            alt="The Barangay Wawa multi-purpose court"
            className="h-64 w-full rounded-xl object-cover shadow-md ring-1 ring-border md:h-80"
          />
        </div>
      </Reveal>

      <div className="gold-divider mx-auto max-w-4xl" aria-hidden />

      {/* services preview */}
      <Reveal as="section" className="paper-texture-cream">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl font-semibold text-forest-deep">
            {t("home.servicesTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("home.servicesBody")}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.name}>
                <Link
                  to="/services"
                  className="block h-full rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <p className="font-display text-base font-semibold text-forest-deep">{s.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.desc}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" className="mt-4 gap-1 text-gold-deep">
            <Link to="/services">
              {t("common.viewAll")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </Reveal>

      {/* announcements teaser */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-forest-deep">
            {t("home.featuredTitle")}
          </h2>
          <Button asChild variant="ghost" className="gap-1 text-gold-deep">
            <Link to="/announcements">
              {t("common.viewAll")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="font-display text-lg text-forest-deep">
              Welcome to the new Barangay Wawa site
            </CardTitle>
            <p className="text-xs text-muted-foreground">Posted by the Barangay Wawa team</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This site brings our services online: request barangay documents, find PWD guides, and
            reserve the multi-purpose court. Announcements from the barangay will appear here.
          </CardContent>
        </Card>
      </Reveal>

      {/* officials teaser */}
      <Reveal as="section" className="paper-texture-cream">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl font-semibold text-forest-deep">
            {t("home.officialsTitle")}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICIALS.slice(0, 4).map((o, i) => (
              <li key={`${o.role}-${i}`} className="rounded-lg border border-border bg-card p-4">
                <p className="font-display text-base font-semibold text-forest-deep">{o.role}</p>
                <p className="text-sm text-muted-foreground">{o.name ?? "Roster coming soon"}</p>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" className="mt-4 gap-1 text-gold-deep">
            <Link to="/officials">
              {t("common.viewAll")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </Reveal>

      {/* map */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl font-semibold text-forest-deep">{t("home.mapTitle")}</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
              {SITE.address}
            </p>
            <p>{SITE.officeHours}</p>
          </div>
          <iframe
            title={`Map showing ${SITE.address}`}
            src="https://www.google.com/maps?q=Wawa,+Taguig,+Metro+Manila&output=embed"
            className="h-72 w-full rounded-xl border border-border"
            loading="lazy"
          />
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal as="section" className="paper-texture-cream">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="font-display text-2xl font-semibold text-forest-deep">{t("home.faqTitle")}</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </div>
  );
}
