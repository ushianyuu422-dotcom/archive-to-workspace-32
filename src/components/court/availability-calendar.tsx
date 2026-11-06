import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { BOOKING_SLOTS } from "@/lib/site";
import { cn } from "@/lib/utils";

export type SlotStatus = "open" | "pending" | "taken" | "mine" | "blocked";

export const SLOT_STATUS_META: Record<SlotStatus, { label: string; className: string }> = {
  open: { label: "Available", className: "bg-secondary text-forest border-forest/30" },
  pending: { label: "Pending request", className: "bg-gold-soft text-forest-deep border-gold-deep/40" },
  taken: { label: "Booked", className: "bg-muted text-muted-foreground border-border" },
  mine: { label: "Your booking", className: "bg-forest text-primary-foreground border-forest" },
  blocked: { label: "Closed (barangay activity)", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export const toISODate = (d: Date) => format(d, "yyyy-MM-dd");
export const slotLabel = (slot: string) => BOOKING_SLOTS.find((s) => s.start === slot)?.label ?? slot;

export function useAvailability(month: Date) {
  const from = toISODate(startOfMonth(month));
  const to = toISODate(endOfMonth(month));
  return useQuery({
    queryKey: ["court-availability", from, to],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("court_availability", { p_from: from, p_to: to });
      if (error) throw new Error(error.message);
      const map = new Map<string, Record<string, SlotStatus>>();
      for (const r of data ?? []) {
        const day = map.get(r.d) ?? {};
        day[r.slot] = r.status as SlotStatus;
        map.set(r.d, day);
      }
      return map;
    },
  });
}

type Props = {
  /** Called when a free slot is clicked. Omit to make the calendar view-only. */
  onPickSlot?: (date: string, slot: string) => void;
  /** Admins may pick any non-blocked slot; residents only open ones. */
  pickable?: (status: SlotStatus) => boolean;
  pickLabel?: string;
};

export function AvailabilityCalendar({ onPickSlot, pickable = (s) => s === "open", pickLabel = "Book" }: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [month, setMonth] = useState(today);
  const [selected, setSelected] = useState<Date>(today);
  const { data: avail, isLoading } = useAvailability(month);

  const dayState = (d: Date) => {
    const slots = avail?.get(toISODate(d));
    if (!slots) return "unknown";
    const v = Object.values(slots);
    if (v.every((s) => s === "blocked")) return "closed";
    if (v.some((s) => s === "open")) return v.every((s) => s === "open") ? "free" : "partial";
    return "full";
  };

  const daySlots = avail?.get(toISODate(selected));
  const past = selected < today;

  return (
    <div className="grid gap-6 rounded-xl border border-border bg-card p-4 md:grid-cols-[auto_1fr] md:p-6">
      <div>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && setSelected(d)}
          month={month}
          onMonthChange={setMonth}
          disabled={{ before: today, after: addDays(today, 60) }}
          modifiers={{
            free: (d) => dayState(d) === "free",
            partial: (d) => dayState(d) === "partial",
            full: (d) => dayState(d) === "full",
            closed: (d) => dayState(d) === "closed",
          }}
          modifiersClassNames={{
            free: "cal-day-free",
            partial: "cal-day-partial",
            full: "cal-day-full",
            closed: "cal-day-closed",
          }}
          className="rounded-lg [--cell-size:2.5rem]"
        />
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-2"><span className="cal-dot cal-day-free" />All slots open</li>
          <li className="flex items-center gap-2"><span className="cal-dot cal-day-partial" />Some slots open</li>
          <li className="flex items-center gap-2"><span className="cal-dot cal-day-full" />Fully booked</li>
          <li className="flex items-center gap-2"><span className="cal-dot cal-day-closed" />Closed</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-forest-deep">
          {format(selected, "EEEE, MMMM d, yyyy")}
        </h3>
        <p className="text-sm text-muted-foreground">Two-hour time slots</p>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {BOOKING_SLOTS.map((s) => {
            const st: SlotStatus = daySlots?.[s.start] ?? "open";
            const meta = SLOT_STATUS_META[st];
            const canPick = !!onPickSlot && !past && pickable(st);
            return (
              <li key={s.start} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", meta.className)}>
                    {isLoading ? "…" : meta.label}
                  </span>
                  {canPick && (
                    <Button size="sm" variant="gold" onClick={() => onPickSlot(toISODate(selected), s.start)}>
                      {pickLabel}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
