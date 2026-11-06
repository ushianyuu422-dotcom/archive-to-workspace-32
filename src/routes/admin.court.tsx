import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subMonths } from "date-fns";
import { toast } from "sonner";
import { Ban, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Pager } from "@/components/court/pager";
import { AvailabilityCalendar, slotLabel, toISODate } from "@/components/court/availability-calendar";
import { ReservationForm, type ReservationValues } from "@/components/court/reservation-form";
import { useSession } from "@/hooks/use-session";
import { BOOKING_SLOTS, SITE } from "@/lib/site";
import {
  adminCreateReservation,
  adminDeleteReservation,
  adminListBlocks,
  adminListReservations,
  adminPurgeReservations,
  adminRemoveBlock,
  adminSetBlock,
  adminStatusCounts,
  adminUpdateReservation,
} from "@/lib/court.functions";

export const Route = createFileRoute("/admin/court")({
  head: () => ({
    meta: [
      { title: `Court Scheduling Admin — ${SITE.name}` },
      { name: "description", content: "Manage court reservations, blocks, and booking history for Barangay Wawa." },
      { property: "og:title", content: `Court Scheduling Admin — ${SITE.name}` },
      { property: "og:description", content: "Admin tools for the Barangay Wawa multi-purpose court." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCourtPage,
});

const TABS = ["pending", "approved", "cancelled", "rejected", "completed", "all"] as const;
type Tab = (typeof TABS)[number];
const STATUSES = ["pending", "approved", "rejected", "cancelled", "completed"];
const PAGE_SIZE = 10;
const EMPTY: ReservationValues = { res_date: "", slot: "", purpose: "", contact_number: "" };

function AdminCourtPage() {
  const { ready, user, isAdmin } = useSession();
  return (
    <div>
      <PageHero kicker="Barangay admin" title="Court Scheduling" body="Approve, reschedule, and clean up court reservations." />
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        {!ready ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !user || !isAdmin ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            This page is for barangay admins only.{" "}
            <Link to={user ? "/court-booking" : "/auth"} className="font-medium text-gold-deep hover:underline">
              {user ? "Back to court booking" : "Log in"}
            </Link>
          </div>
        ) : (
          <AdminCourt />
        )}
      </section>
    </div>
  );
}

function AdminCourt() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [creating, setCreating] = useState<ReservationValues | null>(null);
  const [editing, setEditing] = useState<{ id: string; values: ReservationValues } | null>(null);

  const refresh = () => {
    for (const k of ["admin-reservations", "admin-counts", "court-availability", "admin-blocks"]) qc.invalidateQueries({ queryKey: [k] });
  };

  const list = useQuery({
    queryKey: ["admin-reservations", tab, page, from, to],
    queryFn: () =>
      adminListReservations({
        data: {
          ...(tab !== "all" ? { status: tab } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          page,
          pageSize: PAGE_SIZE,
        },
      }),
  });
  const counts = useQuery({ queryKey: ["admin-counts"], queryFn: () => adminStatusCounts() });
  const total = (t: Tab) =>
    t === "all" ? Object.values(counts.data ?? {}).reduce((a, b) => a + b, 0) : (counts.data?.[t] ?? 0);

  const onErr = (e: Error) => toast.error(e.message);
  const create = useMutation({
    mutationFn: (v: ReservationValues) =>
      adminCreateReservation({
        data: {
          email: v.email ?? "",
          res_date: v.res_date,
          slot: v.slot,
          purpose: v.purpose,
          contact_number: v.contact_number,
          status: (v.status as "pending" | "approved") ?? "approved",
        },
      }),
    onSuccess: () => { toast.success("Reservation created."); setCreating(null); refresh(); },
    onError: onErr,
  });
  const update = useMutation({
    mutationFn: ({ id, v, orig }: { id: string; v: ReservationValues; orig: ReservationValues }) =>
      adminUpdateReservation({
        data: {
          id,
          ...(v.status && v.status !== orig.status ? { status: v.status as "pending" } : {}),
          ...(v.reason ? { reason: v.reason } : {}),
          ...(v.res_date !== orig.res_date ? { res_date: v.res_date } : {}),
          ...(v.slot !== orig.slot ? { slot: v.slot } : {}),
        },
      }),
    onSuccess: () => { toast.success("Reservation updated."); setEditing(null); refresh(); },
    onError: onErr,
  });
  const quick = (id: string, status: string, reason?: string) =>
    adminUpdateReservation({ data: { id, status: status as "pending", ...(reason ? { reason } : {}) } }).then(
      () => { toast.success("Status updated."); refresh(); },
      onErr,
    );
  const remove = (id: string) =>
    confirm("Delete this reservation permanently?") &&
    adminDeleteReservation({ data: { id } }).then(() => { toast.success("Reservation deleted."); refresh(); }, onErr);

  const rows = list.data?.rows ?? [];

  return (
    <>
      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-deep">Schedule</h2>
            <p className="text-sm text-muted-foreground">Click a free slot to book it for a resident (walk-ins).</p>
          </div>
          <Button variant="gold" onClick={() => setCreating({ ...EMPTY, res_date: toISODate(new Date()), status: "approved" })}>
            <Plus className="size-4" /> New reservation
          </Button>
        </div>
        <AvailabilityCalendar
          pickLabel="Add"
          onPickSlot={(date, slot) => setCreating({ ...EMPTY, res_date: date, slot, status: "approved" })}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setPage(1); }}>
            <TabsList className="flex-wrap">
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t} className="capitalize">
                  {t} ({total(t)})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <Label htmlFor="f-from" className="text-xs">From</Label>
              <Input id="f-from" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="f-to" className="text-xs">To</Label>
              <Input id="f-to" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-muted-foreground">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-muted-foreground">No reservations in this view.</TableCell></TableRow>
            ) : (
              rows.map((r) => {
                const res = r.resident as { first_name: string; last_name: string; email: string } | null;
                const values: ReservationValues = {
                  res_date: r.res_date, slot: r.slot, purpose: r.purpose, contact_number: r.contact_number, status: r.status,
                };
                return (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{format(parseISO(r.res_date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="whitespace-nowrap">{slotLabel(r.slot)}</TableCell>
                    <TableCell>
                      {res ? `${res.first_name} ${res.last_name}`.trim() || res.email : "—"}
                      {res && <span className="block text-xs text-muted-foreground">{res.email}</span>}
                    </TableCell>
                    <TableCell className="max-w-[14rem] truncate">{r.purpose}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.contact_number}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="gold" onClick={() => quick(r.id, "approved")}>Approve</Button>{" "}
                          <Button size="sm" variant="outline" onClick={() => {
                            const reason = prompt("Reason for rejection (at least 5 characters):");
                            if (reason) quick(r.id, "rejected", reason);
                          }}>Reject</Button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => quick(r.id, "completed")}>Mark done</Button>
                      )}
                      <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditing({ id: r.id, values })}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Delete" onClick={() => remove(r.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <Pager page={page} pageSize={PAGE_SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Blocks onChange={refresh} />
        <Purge onDone={refresh} />
      </div>

      <ReservationForm
        open={!!creating}
        onOpenChange={(o) => !o && setCreating(null)}
        title="New reservation"
        submitLabel="Create"
        withEmail
        statusOptions={["approved", "pending"]}
        initial={creating ?? EMPTY}
        busy={create.isPending}
        onSubmit={(v) => create.mutate(v)}
      />
      <ReservationForm
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit reservation"
        submitLabel="Save changes"
        statusOptions={STATUSES}
        initial={editing?.values ?? EMPTY}
        busy={update.isPending}
        onSubmit={(v) => editing && update.mutate({ id: editing.id, v, orig: editing.values })}
      />
    </>
  );
}

function Blocks({ onChange }: { onChange: () => void }) {
  const { data = [] } = useQuery({ queryKey: ["admin-blocks"], queryFn: () => adminListBlocks() });
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("all");
  const [reason, setReason] = useState("Barangay activity");
  const today = toISODate(new Date());
  const upcoming = data.filter((b) => b.block_date >= today);

  const add = () =>
    adminSetBlock({ data: { block_date: date, slot: slot === "all" ? null : slot, reason } }).then(
      () => { toast.success("Slot closed."); setDate(""); onChange(); },
      (e: Error) => toast.error(e.message),
    );

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-forest-deep">Close slots for barangay activities</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
          <Input type="date" aria-label="Block date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select value={slot} onValueChange={setSlot}>
            <SelectTrigger aria-label="Block slot"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Whole day</SelectItem>
              {BOOKING_SLOTS.map((s) => <SelectItem key={s.start} value={s.start}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button variant="gold" disabled={!date} onClick={add}><Ban className="size-4" /> Close</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Reason</TableHead><TableHead /></TableRow>
        </TableHeader>
        <TableBody>
          {upcoming.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-muted-foreground">No upcoming closures.</TableCell></TableRow>
          ) : (
            upcoming.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="whitespace-nowrap">{format(parseISO(b.block_date), "MMM d, yyyy")}</TableCell>
                <TableCell>{b.slot ? slotLabel(b.slot) : "Whole day"}</TableCell>
                <TableCell>{b.reason}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" aria-label="Reopen"
                    onClick={() => adminRemoveBlock({ data: { id: b.id } }).then(() => { toast.success("Slot reopened."); onChange(); }, (e: Error) => toast.error(e.message))}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function Purge({ onDone }: { onDone: () => void }) {
  const [before, setBefore] = useState(toISODate(subMonths(new Date(), 6)));
  const [statuses, setStatuses] = useState<string[]>(["cancelled", "rejected", "completed"]);
  const toggle = (s: string) => setStatuses((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const run = () => {
    if (!confirm(`Permanently delete ${statuses.join(", ")} bookings dated before ${before}? This cannot be undone.`)) return;
    adminPurgeReservations({ data: { before, statuses: statuses as ("cancelled" | "rejected" | "completed")[] } }).then(
      (r) => { toast.success(`Deleted ${r.deleted} old booking${r.deleted === 1 ? "" : "s"}.`); onDone(); },
      (e: Error) => toast.error(e.message),
    );
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-display text-lg font-semibold text-forest-deep">Purge old booking history</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Data disposition: permanently remove finished bookings once they have served their purpose. Pending and approved bookings are never purged.
      </p>
      <div className="mt-4 grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="purge-before">Delete bookings dated before</Label>
          <Input id="purge-before" type="date" value={before} max={toISODate(new Date())} onChange={(e) => setBefore(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-4">
          {["cancelled", "rejected", "completed"].map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm capitalize">
              <Checkbox checked={statuses.includes(s)} onCheckedChange={() => toggle(s)} /> {s}
            </label>
          ))}
        </div>
        <Button variant="destructive" disabled={!before || statuses.length === 0} onClick={run} className="justify-self-start">
          <Trash2 className="size-4" /> Purge history
        </Button>
      </div>
    </div>
  );
}
