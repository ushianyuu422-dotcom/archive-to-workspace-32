import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HotlinesModal } from "@/components/hotlines-modal";
import { useLang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo.png";

const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/services", key: "nav.services" },
  { to: "/pwd", key: "nav.pwd" },
  { to: "/court-booking", key: "nav.court" },
  { to: "/announcements", key: "nav.announcements" },
  { to: "/officials", key: "nav.officials" },
  { to: "/contact", key: "nav.contact" },
] as const;

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return "";
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(now);
}

function useSignedIn() {
  const [state, setState] = useState<{ email: string | null } | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setState({ email: data.session?.user.email ?? null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setState({ email: session?.user.email ?? null });
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return state;
}

export function SiteHeader() {
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const session = useSignedIn();
  const navigate = useNavigate();
  const dateLabel = useClock();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40">
      {/* slim top bar: live date + hotlines + language */}
      <div className="bg-forest-deep text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <p className="truncate">{dateLabel}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "fil" : "en")}
              className="rounded-sm border border-white/25 px-2 py-0.5 hover:bg-white/10"
              aria-label="Toggle language between English and Filipino"
            >
              {lang === "en" ? "Filipino" : "English"}
            </button>
            <span aria-hidden className="hidden sm:inline text-gold">|</span>
            <HotlinesModal />
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-3" aria-label={`${SITE.name} home`}>
            <img
              src={logoAsset}
              alt={`${SITE.name} seal`}
              className="size-11 rounded-full bg-card shadow-sm ring-1 ring-gold/60"
            />
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold text-forest-deep">
                Barangay Wawa <span className="text-gold-deep">United</span>
              </span>
              <span className="block text-[11px] tracking-wide text-muted-foreground">
                {SITE.city} · Serbisyong tapat, para sa lahat
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-2.5 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-secondary hover:text-forest-deep focus-visible:outline-2 focus-visible:outline-gold-deep"
                activeProps={{ className: "bg-secondary text-forest-deep" }}
              >
                {t(n.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to="/account" className="gap-1.5">
                  <UserRound className="size-4" aria-hidden />
                  {t("nav.myAccount")}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">{t("nav.signIn")}</Link>
              </Button>
            )}
            <button
              className="inline-flex size-10 items-center justify-center rounded-md border border-border lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* mobile menu: one-thumb friendly */}
        {menuOpen && (
          <nav aria-label="Mobile" className="border-t border-border bg-background lg:hidden">
            <ul className="mx-auto max-w-6xl px-4 py-2">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-md px-3 text-base font-medium hover:bg-secondary"
                    activeProps={{ className: "bg-secondary text-forest-deep" }}
                  >
                    {t(n.key)}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-border pt-2">
                {session ? (
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="lg" className="flex-1">
                      <Link to="/account" onClick={() => setMenuOpen(false)}>
                        {t("nav.myAccount")}
                      </Link>
                    </Button>
                    <Button variant="ghost" size="lg" onClick={signOut}>
                      {t("nav.signOut")}
                    </Button>
                  </div>
                ) : (
                  <Button asChild variant="gold" size="lg" className="w-full">
                    <Link to="/auth" onClick={() => setMenuOpen(false)}>
                      {t("nav.signIn")}
                    </Link>
                  </Button>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
