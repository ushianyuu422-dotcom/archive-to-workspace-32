import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { AvailabilityCalendar } from "@/components/court/availability-calendar";
import { MyBookings } from "@/components/court/my-bookings";
import { ReservationForm, type ReservationValues } from "@/components/court/reservation-form";
import { createReservation } from "@/lib/court.functions";

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
  const { user, isAdmin, ready } = useSession();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<ReservationValues | null>(null);
  const book = useMutation({
    mutationFn: (v: ReservationValues) =>
      createReservation({ data: { res_date: v.res_date, slot: v.slot, purpose: v.purpose, contact_number: v.contact_number } }),
    onSuccess: () => {
      toast.success("Booking sent. The barangay will review it.");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["my-reservations"] });
      qc.invalidateQueries({ queryKey: ["court-availability"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHero
        kicker="Multi-purpose court, Barangay Wawa"
        title="Court Booking"
        body="Reserve the court for basketball, volleyball, community events, and practices in two-hour slots."
      />

      <section className="mx-auto max-w-5xl space-y-8 px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-deep">Availability calendar</h2>
            <p className="text-sm text-muted-foreground">Pick a date to see which time slots are free.</p>
          </div>
          {ready && isAdmin && (
            <Button asChild variant="outline-gold">
              <Link to="/admin/court">Open court admin</Link>
            </Button>
          )}
        </div>
        <AvailabilityCalendar
          onPickSlot={(date, slot) => {
            if (!user) {
              toast.info("Log in to book a slot.");
              return;
            }
            setDraft({ res_date: date, slot, purpose: "", contact_number: "" });
          }}
          pickLabel={user ? "Book" : "Log in to book"}
        />
        {ready && !user && (
          <p className="text-sm text-muted-foreground">
            Guests can view the schedule.{" "}
            <Link to="/auth" className="font-medium text-gold-deep hover:underline">Log in or sign up</Link> to book and see your history.
          </p>
        )}
        {ready && user && <MyBookings />}
      </section>

      <ReservationForm
        open={!!draft}
        onOpenChange={(o) => !o && setDraft(null)}
        title="Book the court"
        submitLabel="Send booking"
        initial={draft ?? { res_date: "", slot: "", purpose: "", contact_number: "" }}
        busy={book.isPending}
        onSubmit={(v) => book.mutate(v)}
      />

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
