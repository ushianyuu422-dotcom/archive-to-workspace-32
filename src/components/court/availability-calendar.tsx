import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { isSlotPast, manilaNow } from "@/lib/court-time";
import { supabase } from "@/integrations/supabase/client";
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type DayState = "free" | "partial" | "full" | "closed" | "past";

const TILE: Record<DayState, string> = {
  free: "tile-free",
  partial: "tile-partial",
  full: "tile-full",
  closed: "tile-closed",
  past: "tile-past",
};

export function AvailabilityCalendar({ onPickSlot, pickable = (s) => s === "open", pickLabel = "Book" }: Props) {
  const now = manilaNow();
  const todayStr = now.date;
  const maxStr = toISODate(addDays(parseISO(todayStr), 60));
  const [month, setMonth] = useState(() => startOfMonth(parseISO(todayStr)));
  const [selected, setSelected] = useState(todayStr);
  const { data: avail, isLoading } = useAvailability(month);

  const slotState = (date: string, slot: string): SlotStatus | "ended" => {
    if (isSlotPast(date, slot, now)) return "ended";
    return avail?.get(date)?.[slot] ?? "open";
  };

  const dayState = (date: string): DayState => {
    if (date < todayStr || date > maxStr) return "past";
    const v = BOOKING_SLOTS.map((s) => slotState(date, s.start)).filter((x) => x !== "ended");
    if (v.length === 0) return "past";
    if (v.every((x) => x === "blocked")) return "closed";
    if (v.some((x) => x === "open")) return v.every((x) => x === "open") ? "free" : "partial";
    return "full";
  };

  const days = eachDayOfInterval({ start: startOfWeek(month), end: endOfWeek(endOfMonth(month)) });
  const canPrev = month > startOfMonth(parseISO(todayStr));
  const canNext = addMonths(month, 1) <= parseISO(maxStr);

  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-4 md:grid-cols-[minmax(0,22rem)_1fr] md:p-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-forest-deep">{format(month, "MMMM yyyy")}</p>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={!canPrev} onClick={() => setMonth(subMonths(month, 1))} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="sm" variant="ghost" disabled={!canNext} onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
          {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const iso = toISODate(d);
            if (!isSameMonth(d, month)) return <span key={iso} aria-hidden />;
            const st = dayState(iso);
            const disabled = st === "past";
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => setSelected(iso)}
                aria-label={format(d, "MMMM d")}
                aria-pressed={selected === iso}
                className={cn("cal-tile", TILE[st], selected === iso && "cal-tile-selected", iso === todayStr && "cal-tile-today")}
              >
                {format(d, "d")}
              </button>
            );
          })}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5"><span className="cal-swatch tile-free" />Open</li>
          <li className="flex items-center gap-1.5"><span className="cal-swatch tile-partial" />Few left</li>
          <li className="flex items-center gap-1.5"><span className="cal-swatch tile-full" />Full</li>
          <li className="flex items-center gap-1.5"><span className="cal-swatch tile-closed" />Closed</li>
        </ul>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-forest-deep">{format(parseISO(selected), "EEEE, MMMM d")}</h3>
        <p className="text-sm text-muted-foreground">Two-hour time slots · Philippine time</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {BOOKING_SLOTS.map((s) => {
            const st = slotState(selected, s.start);
            const ended = st === "ended";
            const meta = ended ? { label: "Time has passed", className: "bg-muted text-muted-foreground border-border" } : SLOT_STATUS_META[st];
            const canPick = !!onPickSlot && !ended && pickable(st as SlotStatus);
            return (
              <li key={s.start} className={cn("flex flex-col gap-2 rounded-xl border border-border p-3", ended && "opacity-60")}>
                <span className="text-sm font-medium">{s.label}</span>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", meta.className)}>
                    {isLoading && !ended ? "…" : meta.label}
                  </span>
                  {canPick && (
                    <Button size="sm" variant="gold" onClick={() => onPickSlot(selected, s.start)}>
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
