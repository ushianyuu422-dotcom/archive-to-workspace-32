import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: `Announcements — ${SITE.name}` },
      { name: "description", content: "Official announcements, advisories, and event notices from Barangay Wawa, Taguig City." },
      { property: "og:title", content: `Announcements — ${SITE.name}` },
      { property: "og:description", content: "Advisories and event notices from Barangay Wawa, Taguig City." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <div>
      <PageHero
        kicker="Barangay advisories and events"
        title="Announcements"
        body="Official posts from the barangay — advisories, schedules, and community events."
      />
      <Reveal as="section" className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg text-forest-deep">
              <Megaphone className="size-5 text-gold-deep" aria-hidden />
              Welcome to the new Barangay Wawa site
            </CardTitle>
            <p className="text-xs text-muted-foreground">Posted by the Barangay Wawa team</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This site brings our services online: request barangay documents, find PWD guides, and
            reserve the multi-purpose court. More announcements will be posted here as events come
            up — check back soon.
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
