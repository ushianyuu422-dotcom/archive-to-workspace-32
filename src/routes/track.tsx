import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { TRACK_STATUS_HELP } from "@/lib/site";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track a Request — Barangay Wawa United" },
      { name: "description", content: "Follow up on a barangay service request, complaint, or court booking using your reference code." },
      { property: "og:title", content: "Track a Request — Barangay Wawa United" },
      { property: "og:description", content: "Follow up on a request, complaint, or booking with your reference code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState("");

  return (
    <div>
      <PageHero
        kicker="Check your status"
        title="Track a Request"
        body="Enter the reference code from your claim stub to see where your request is."
      />
      <Reveal as="section" className="mx-auto max-w-3xl px-4 py-12">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(code.trim());
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. WAWA-2026-0001"
            aria-label="Reference code"
            required
          />
          <Button type="submit" variant="gold" className="gap-2">
            <Search className="size-4" aria-hidden />
            Track
          </Button>
        </form>

        {submitted && (
          <div role="status" className="mt-6 rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-medium text-forest-deep">Reference {submitted}</p>
            <p className="mt-1 text-muted-foreground">
              Online lookup is launching soon. In the meantime, the statuses we use are:
            </p>
            <ul className="mt-3 space-y-1.5 text-muted-foreground">
              {Object.entries(TRACK_STATUS_HELP).slice(0, 5).map(([k, v]) => (
                <li key={k}>
                  <span className="font-semibold text-foreground">{k}</span> — {v}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>
    </div>
  );
}
