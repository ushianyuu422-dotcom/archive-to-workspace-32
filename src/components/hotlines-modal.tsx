import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";
import { HOTLINES, SITE } from "@/lib/site";

function HotlineList({ title, items }: { title: string; items: { label: string; number: string }[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-lg font-semibold text-forest-deep">{title}</h3>
      <ul className="divide-y divide-border">
        {items.map((h) => (
          <li key={h.label} className="flex items-center justify-between gap-4 py-2">
            <span className="text-sm">{h.label}</span>
            <a
              href={`tel:${h.number.replace(/[^0-9+]/g, "")}`}
              className="rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-forest hover:bg-accent/40"
            >
              {h.number}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HotlinesModal() {
  const [open, setOpen] = useState(false);
  const [openTl, setOpenTl] = useState(false);

  // Alt + H opens hotlines quickly from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h" && e.altKey) setOpenTl(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open || openTl} onOpenChange={(v) => { setOpen(v); setOpenTl(v); }}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Siren className="size-4" aria-hidden />
          Hotlines
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-forest-deep">Emergency Hotlines</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          {SITE.officeHours}. For life-threatening emergencies, call 911 first.
        </p>
        <HotlineList title="Taguig City" items={HOTLINES.taguig} />
        <div className="gold-divider" />
        <HotlineList title="National" items={HOTLINES.national} />
        <p className="text-xs text-muted-foreground">
          Tip: press Alt + H anywhere to open this list. Numbers marked XXXX are placeholders —
          the barangay will fill them in.
        </p>
      </DialogContent>
    </Dialog>
  );
}
