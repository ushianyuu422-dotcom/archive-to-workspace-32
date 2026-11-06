import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: `My Account — ${SITE.name}` },
      { name: "description", content: "Your Barangay Wawa United account: bookings, requests, and settings." },
      { property: "og:title", content: `My Account — ${SITE.name}` },
      { property: "og:description", content: "Your bookings, requests, and account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setEmail(data.session?.user.email ?? null);
        setReady(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
      else setEmail(session?.user.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div>
      <PageHero kicker="Resident account" title="My Account" />
      <Reveal as="section" className="mx-auto max-w-3xl px-4 py-12">
        {!ready ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !email ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              You are not signed in yet.
            </p>
            <Button asChild variant="gold" className="mt-4">
              <Link to="/auth">Log in / Sign up</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-6">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-forest">
                <UserRound className="size-6" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-forest-deep">{email}</p>
                <p className="text-sm text-muted-foreground">Signed in to {SITE.name}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="font-display text-base font-semibold text-forest-deep">
                Your bookings and requests
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Request and booking history appears here once online requests launch. You can
                already{" "}
                <Link to="/track" className="font-medium text-gold-deep hover:underline">
                  track a request
                </Link>{" "}
                with your reference code.
              </p>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          </div>
        )}
      </Reveal>
    </div>
  );
}
