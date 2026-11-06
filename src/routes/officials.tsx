import { createFileRoute } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { OFFICIALS } from "@/lib/content";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/officials")({
  head: () => ({
    meta: [
      { title: `Barangay Officials — ${SITE.name}` },
      { name: "description", content: "The elected and appointed officials serving Barangay Wawa, Taguig City, and their committee assignments." },
      { property: "og:title", content: `Barangay Officials — ${SITE.name}` },
      { property: "og:description", content: "The people serving Wawa and their committee assignments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfficialsPage,
});

function OfficialsPage() {
  return (
    <div>
      <PageHero
        kicker="Serving Wawa"
        title="Barangay Officials"
        body="The officials and their committee assignments. Names will be posted as the roster is finalized."
      />
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-12">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICIALS.map((o, i) => (
            <li
              key={`${o.role}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-forest">
                <UserRound className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-display text-base font-semibold text-forest-deep">
                  {o.role}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {o.name ?? (o.committee ? `Committee on ${o.committee}` : "Name coming soon")}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted-foreground">
          Official roster as maintained by {SITE.name}. To report a correction, contact the
          barangay hall.
        </p>
      </Reveal>
    </div>
  );
}
