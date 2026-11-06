import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Use — ${SITE.name}` },
      { name: "description", content: `Terms of use for the ${SITE.name} website and online services.` },
      { property: "og:title", content: `Terms of Use — ${SITE.name}` },
      { property: "og:description", content: "Terms of use for the Barangay Wawa United website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function H2({ children }: { children: string }) {
  return (
    <h2 className="mt-8 font-display text-xl font-semibold text-forest-deep">{children}</h2>
  );
}

function TermsPage() {
  return (
    <div>
      <PageHero
        kicker="Using this site"
        title="Terms of Use"
        body={`The ground rules for using the ${SITE.name} website.`}
      />
      <Reveal as="section" className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted-foreground">
        <H2>Acceptable use</H2>
        <p>
          Use this site for legitimate barangay transactions only. Do not submit false
          information, impersonate others, attempt to access records you are not entitled to, or
          interfere with the site's operation.
        </p>

        <H2>Accounts</H2>
        <p>
          You are responsible for keeping your account credentials secure and for activity under
          your account. Notify the barangay hall if you believe your account has been compromised.
        </p>

        <H2>Bookings and requests</H2>
        <p>
          Submitting a booking or request is not a confirmation until approved by the barangay.
          Approved bookings follow the court's house rules; the barangay may reschedule or cancel
          slots for official activities.
        </p>

        <H2>Content</H2>
        <p>
          Announcements and advisories posted here are official barangay communications. The
          barangay seal, photos, and text on this site belong to {SITE.name} and may not be
          reused without permission.
        </p>

        <H2>Liability</H2>
        <p>
          The site is provided as-is. The barangay is not liable for losses arising from service
          interruptions, but will work to restore access and process affected transactions.
        </p>

        <H2>Contact</H2>
        <p>
          Questions about these terms: {SITE.address}, or email{" "}
          <a href={`mailto:${SITE.email}`} className="underline hover:no-underline">{SITE.email}</a>.
        </p>
      </Reveal>
    </div>
  );
}
