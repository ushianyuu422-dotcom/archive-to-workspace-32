import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${SITE.name}` },
      { name: "description", content: `How ${SITE.name} collects, uses, and protects personal data under the Data Privacy Act (RA 10173).` },
      { property: "og:title", content: `Privacy Policy — ${SITE.name}` },
      { property: "og:description", content: "How we handle personal data under the Data Privacy Act (RA 10173)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function H2({ children, id }: { children: string; id?: string }) {
  return (
    <h2 id={id} className="mt-8 font-display text-xl font-semibold text-forest-deep">
      {children}
    </h2>
  );
}

function PrivacyPage() {
  return (
    <div>
      <PageHero
        kicker="Data Privacy Act (RA 10173)"
        title="Privacy Policy"
        body={`How ${SITE.name} handles your personal data.`}
      />
      <Reveal as="section" className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted-foreground">
        <H2>What we collect</H2>
        <p>
          When you request barangay services, book the court, or use the PWD portal, we collect
          only what the service requires: your name, contact details, address, valid ID
          information, and the details of your request. Account sign-up collects your email
          address.
        </p>

        <H2>Why we collect it</H2>
        <p>
          To process your requests, verify residency, maintain barangay records required by law,
          contact you about your request or booking, and improve barangay services.
        </p>

        <H2>Who can see your data</H2>
        <p>
          Authorized barangay personnel and, where required, the City of Taguig offices we
          transact with. We do not sell your data or share it for marketing.
        </p>

        <H2>How long we keep it</H2>
        <p>
          Records are kept only as long as needed for the purpose they were collected for, or as
          required by law and the Commission on Audit's retention schedules, after which they are
          securely disposed of.
        </p>

        <H2 id="dpa">Your rights under the Data Privacy Act</H2>
        <p>
          You have the right to be informed, to access your data, to request correction, to
          object to processing, to request erasure, and to file a complaint with the National
          Privacy Commission. To exercise any of these rights, contact the barangay hall or email{" "}
          <a href={`mailto:${SITE.email}`} className="underline hover:no-underline">{SITE.email}</a>.
        </p>

        <H2>Security</H2>
        <p>
          Records are stored in systems with access limited to authorized personnel. Physical
          records are kept in the barangay hall's records section.
        </p>

        <H2>Changes to this policy</H2>
        <p>
          Updates will be posted on this page. Continued use of the site after an update means you
          accept the revised policy.
        </p>
        <p className="mt-8 text-xs">Last updated: {new Date().getFullYear()}</p>
      </Reveal>
    </div>
  );
}
