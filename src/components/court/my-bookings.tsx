import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Pager } from "@/components/court/pager";
import { ReservationForm, type ReservationValues } from "@/components/court/reservation-form";
import { slotLabel } from "@/components/court/availability-calendar";
import { cancelMyReservation, deleteMyReservation, getMyReservations, updateMyReservation } from "@/lib/court.functions";

const TABS = ["all", "pending", "approved", "cancelled", "rejected", "completed"] as const;
const PAGE_SIZE = 8;
const FINISHED = ["cancelled", "rejected", "completed"];

export function MyBookings() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ id: string; values: ReservationValues } | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["my-reservations"], queryFn: () => getMyReservations() });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["my-reservations"] });
    qc.invalidateQueries({ queryKey: ["court-availability"] });
  };

  const sorted = useMemo(
    () => [...data].sort((a, b) => (a.res_date === b.res_date ? b.slot.localeCompare(a.slot) : b.res_date.localeCompare(a.res_date))),
    [data],
  );
  const filtered = tab === "all" ? sorted : sorted.filter((r) => r.status === tab);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const count = (t: string) => (t === "all" ? data.length : data.filter((r) => r.status === t).length);

  const run = (fn: () => Promise<unknown>, msg: string) =>
    fn().then(
      () => {
        toast.success(msg);
        refresh();
      },
      (e: Error) => toast.error(e.message),
    );

  const edit = useMutation({
    mutationFn: (v: ReservationValues & { id: string }) =>
      updateMyReservation({ data: { id: v.id, res_date: v.res_date, slot: v.slot, purpose: v.purpose, contact_number: v.contact_number } }),
    onSuccess: () => {
      toast.success("Booking updated.");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-forest-deep">My booking history</h3>
        <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(1); }}>
          <TabsList className="flex-wrap">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">
                {t} ({count(t)})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-muted-foreground">Loading…</TableCell></TableRow>
          ) : rows.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-muted-foreground">No bookings here yet.</TableCell></TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{format(parseISO(r.res_date), "MMM d, yyyy")}</TableCell>
                <TableCell className="whitespace-nowrap">{slotLabel(r.slot)}</TableCell>
                <TableCell className="max-w-[16rem] truncate">
                  {r.purpose}
                  {r.rejection_reason && <span className="block text-xs text-destructive">Reason: {r.rejection_reason}</span>}
                </TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {r.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" aria-label="Edit booking"
                        onClick={() => setEditing({ id: r.id, values: { res_date: r.res_date, slot: r.slot, purpose: r.purpose, contact_number: r.contact_number } })}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Cancel booking"
                        onClick={() => confirm("Cancel this booking?") && run(() => cancelMyReservation({ data: { id: r.id } }), "Booking cancelled.")}>
                        <XCircle className="size-4" />
                      </Button>
                    </>
                  )}
                  {FINISHED.includes(r.status) && (
                    <Button size="sm" variant="ghost" aria-label="Delete from history"
                      onClick={() => confirm("Remove this booking from your history? This cannot be undone.") && run(() => deleteMyReservation({ data: { id: r.id } }), "Removed from history.")}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />

      <ReservationForm
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit booking"
        submitLabel="Save changes"
        initial={editing?.values ?? { res_date: "", slot: "", purpose: "", contact_number: "" }}
        busy={edit.isPending}
        onSubmit={(v) => editing && edit.mutate({ ...v, id: editing.id })}
      />
    </div>
  );
}
