import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { BOOKING_SLOTS, SITE } from "@/lib/site";

export const Route = createFileRoute("/court-booking")({
  head: () => ({
    meta: [
      { title: `Court Booking — ${SITE.name}` },
      { name: "description", content: "Reserve the Barangay Wawa multi-purpose court in two-hour slots. See the daily schedule and booking rules." },
      { property: "og:title", content: `Court Booking — ${SITE.name}` },
      { property: "og:description", content: "Two-hour slots for the barangay multi-purpose court, with simple rules and walk-in hours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CourtBookingPage,
});

function CourtBookingPage() {
  return (
    <div>
      <PageHero
        kicker="Multi-purpose court, Barangay Wawa"
        title="Court Booking"
        body="Reserve the court for basketball, volleyball, community events, and practices in two-hour slots."
      />

      <Reveal as="section" className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="font-display text-2xl font-semibold text-forest-deep">Daily slots</h2>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
          {BOOKING_SLOTS.map((s) => (
            <li key={s.start} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium">{s.label}</span>
              <Badge variant="secondary">Open</Badge>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Online reservation with real-time slot availability is coming soon. Until then, book at
          the barangay hall or {SITE.officeHours.toLowerCase()} by phone.
        </p>
      </Reveal>

      <Reveal as="section" className="paper-texture-cream">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h2 className="font-display text-2xl font-semibold text-forest-deep">House rules</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Bookings are confirmed once approved by the barangay; pending slots may be released.</li>
            <li>Barangay activities (fiesta, clean-up drives, vaccination days) take priority and slots may be blocked.</li>
            <li>Keep the court clean. Return borrowed equipment to the hall.</li>
            <li>Games end on time so the next group can start theirs.</li>
            <li>No gambling, drinking, or overnight use of the court.</li>
          </ul>
          <Button asChild variant="gold" className="mt-6">
            <Link to="/contact">Ask about a booking</Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
