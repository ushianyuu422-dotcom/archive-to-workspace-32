import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Facebook } from "lucide-react";
import { SITE } from "@/lib/site";
import logoAsset from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-forest-deep text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[auto_1fr_1fr]">
          <div className="flex items-start gap-3">
            <img
              src={logoAsset}
              alt={`${SITE.name} seal`}
              className="size-16 rounded-full bg-card/90 ring-2 ring-gold/70"
            />
            <div>
              <p className="font-display text-xl font-semibold">
                Barangay Wawa <span className="text-gold">United</span>
              </p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                {SITE.city}
              </p>
            </div>
          </div>

          <nav aria-label="Footer" className="text-sm">
            <p className="mb-3 font-display text-base text-gold">Explore</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              <li><Link to="/" className="hover:text-gold">Home</Link></li>
              <li><Link to="/services" className="hover:text-gold">Services</Link></li>
              <li><Link to="/pwd" className="hover:text-gold">PWD Portal</Link></li>
              <li><Link to="/court-booking" className="hover:text-gold">Court Booking</Link></li>
              <li><Link to="/announcements" className="hover:text-gold">Announcements</Link></li>
              <li><Link to="/officials" className="hover:text-gold">Officials</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
              <li><Link to="/track" className="hover:text-gold">Track a request</Link></li>
            </ul>
          </nav>

          <div className="text-sm">
            <p className="mb-3 font-display text-base text-gold">Visit or reach us</p>
            <ul className="space-y-2 text-primary-foreground/90">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                {SITE.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-gold" aria-hidden />
                {SITE.officeHours}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-gold" aria-hidden />
                {SITE.email}
              </li>
              <li className="flex items-center gap-2">
                <Facebook className="size-4 shrink-0 text-gold" aria-hidden />
                <a href={SITE.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">
                  Barangay Wawa United on Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-5 text-xs text-primary-foreground/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {SITE.name}. Proudly serving Wawa, {SITE.city}.</p>
            <p className="flex gap-4">
              <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gold">Terms of Use</Link>
              <Link to="/privacy" hash="dpa" className="hover:text-gold">Data Privacy Act (RA 10173)</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
