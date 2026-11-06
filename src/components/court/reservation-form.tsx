import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BOOKING_SLOTS } from "@/lib/site";

export type ReservationValues = {
  res_date: string;
  slot: string;
  purpose: string;
  contact_number: string;
  email?: string;
  status?: string;
  reason?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial: ReservationValues;
  submitLabel: string;
  /** Extra fields: resident email (admin create) and status (admin edit). */
  withEmail?: boolean;
  statusOptions?: string[];
  busy?: boolean;
  onSubmit: (v: ReservationValues) => void;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function ReservationForm({ open, onOpenChange, title, initial, submitLabel, withEmail, statusOptions, busy, onSubmit }: Props) {
  const [v, setV] = useState<ReservationValues>(initial);
  useEffect(() => {
    if (open) setV(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (k: keyof ReservationValues, val: string) => setV((p) => ({ ...p, [k]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          id="reservation-form"
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(v);
          }}
        >
          {withEmail && (
            <div className="grid gap-1.5">
              <Label htmlFor="rf-email">Resident account email</Label>
              <Input id="rf-email" type="email" required value={v.email ?? ""} onChange={(e) => set("email", e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="rf-date">Date</Label>
              <Input id="rf-date" type="date" required value={v.res_date} onChange={(e) => set("res_date", e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Time</Label>
              <Select value={v.slot} onValueChange={(x) => set("slot", x)}>
                <SelectTrigger aria-label="Time slot">
                  <SelectValue placeholder="Pick a slot" />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_SLOTS.map((s) => (
                    <SelectItem key={s.start} value={s.start}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {statusOptions && (
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={v.status ?? ""} onValueChange={(x) => set("status", x)}>
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {v.status === "rejected" && statusOptions && (
            <div className="grid gap-1.5">
              <Label htmlFor="rf-reason">Reason for rejection</Label>
              <Input id="rf-reason" value={v.reason ?? ""} onChange={(e) => set("reason", e.target.value)} />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="rf-purpose">Purpose</Label>
            <Textarea id="rf-purpose" required value={v.purpose} onChange={(e) => set("purpose", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rf-contact">Contact number</Label>
            <Input id="rf-contact" required placeholder="09XXXXXXXXX" value={v.contact_number} onChange={(e) => set("contact_number", e.target.value)} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="submit" form="reservation-form" variant="gold" disabled={busy}>
            {busy ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
