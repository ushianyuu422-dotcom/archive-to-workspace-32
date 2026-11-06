import type { TablesUpdate } from "@/integrations/supabase/types";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { reservationSchema, dateString } from "@/lib/validation";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { BOOKING_SLOTS } from "@/lib/site";

type Ctx = { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string };

async function assertAdmin(context: Ctx) {
  const { data: admin } = await context.supabase.rpc("is_admin");
  if (!admin) throw new Error("Admin access required.");
}

async function notify(
  supabase: Ctx["supabase"],
  userId: string,
  title: string,
  body: string,
  link?: string,
) {
  await supabase.from("notifications").insert({ user_id: userId, title, body, link: link ?? null });
}

export function isValidSlot(slot: string): boolean {
  return BOOKING_SLOTS.some((s) => s.start === slot);
}

export const getDayAvailability = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ date: dateString }).parse(data))
  .handler(async ({ data, context }) => {
    const slots = await Promise.all(
      BOOKING_SLOTS.map(async (s) => {
        const { data: status } = await context.supabase.rpc("court_slot_status", {
          p_date: data.date,
          p_slot: s.start,
        });
        return { slot: s.start, label: s.label, status: status ?? "open" };
      }),
    );
    return slots;
  });

export const createReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reservationSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("status")
      .eq("id", context.userId)
      .single();
    if (profile?.status !== "approved") {
      throw new Error("Your account must be approved before booking the court.");
    }
    if (!isValidSlot(data.slot)) throw new Error("Choose one of the daily time slots.");

    const today = new Date().toISOString().slice(0, 10);
    if (data.res_date < today) throw new Error("Pick today or a future date.");
    const max = new Date(Date.now() + 60 * 86400_000).toISOString().slice(0, 10);
    if (data.res_date > max) throw new Error("Bookings open up to 60 days ahead.");

    const { data: status } = await context.supabase.rpc("court_slot_status", {
      p_date: data.res_date,
      p_slot: data.slot,
    });
    if (status === "blocked") throw new Error("That slot is closed for a barangay activity.");
    if (status === "taken") throw new Error("That slot is already reserved. Pick another.");
    if (status === "mine") {
      throw new Error("You already have a reservation for this slot. See My Reservations.");
    }

    const { error } = await context.supabase
      .from("court_reservations")
      .insert({ ...data, user_id: context.userId, status: "pending" });
    if (error) {
      if (error.code === "23505") {
        throw new Error("That slot was just reserved by someone else. Pick another slot.");
      }
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const getMyReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("court_reservations")
      .select("*")
      .order("res_date", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const cancelMyReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("court_reservations")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminListReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ status: z.string().optional(), from: dateString.optional(), to: dateString.optional() })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let query = context.supabase
      .from("court_reservations")
      .select("*, resident:profiles(first_name, middle_name, last_name, email)")
      .order("res_date", { ascending: false });
    if (data.status) query = query.eq("status", data.status as "pending");
    if (data.from) query = query.gte("res_date", data.from);
    if (data.to) query = query.lte("res_date", data.to);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected", "cancelled", "completed"]).optional(),
        reason: z.string().trim().max(500).optional(),
        res_date: dateString.optional(),
        slot: z.string().max(20).optional(),
      })
      .refine((d) => d.status !== "rejected" || (d.reason ?? "").length >= 5, {
        message: "Give a rejection reason (at least 5 characters).",
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row } = await context.supabase
      .from("court_reservations")
      .select("id, user_id, res_date, slot")
      .eq("id", data.id)
      .single();
    if (!row) throw new Error("Reservation not found.");

    const values: TablesUpdate<"court_reservations"> = {};
    if (data.status) {
      values.status = data.status;
      values.rejection_reason = data.status === "rejected" ? (data.reason ?? null) : null;
    }
    if (data.res_date) values.res_date = data.res_date;
    if (data.slot) {
      if (!isValidSlot(data.slot)) throw new Error("Choose one of the daily time slots.");
      values.slot = data.slot;
    }
    if (data.res_date || data.slot) {
      const newDate = (data.res_date ?? row.res_date) as string;
      const newSlot = (data.slot ?? row.slot) as string;
      const { data: conflict } = await context.supabase
        .from("court_reservations")
        .select("id")
        .eq("res_date", newDate)
        .eq("slot", newSlot)
        .in("status", ["pending", "approved"])
        .neq("id", data.id)
        .maybeSingle();
      if (conflict) throw new Error("Another active reservation already occupies that slot.");
      const { data: blocked } = await context.supabase.rpc("court_slot_status", {
        p_date: newDate,
        p_slot: newSlot,
      });
      if (blocked === "blocked") throw new Error("That slot is blocked for a barangay activity.");
    }

    const { error } = await context.supabase
      .from("court_reservations")
      .update(values)
      .eq("id", data.id);
    if (error) {
      if (error.code === "23505") throw new Error("That slot was just reserved. Reschedule to a free slot.");
      throw new Error(error.message);
    }

    if (data.status) {
      const label: Record<string, string> = {
        pending: "set back to Pending",
        approved: "approved",
        rejected: "rejected",
        cancelled: "cancelled",
        completed: "marked completed",
      };
      await notify(
        context.supabase,
        row.user_id,
        `Court reservation ${data.status === "rejected" ? "rejected" : "updated"}`,
        data.status === "rejected"
          ? `Your reservation for ${row.res_date} (${row.slot}) was rejected. Reason: ${data.reason ?? "Not specified."}`
          : `Your reservation for ${row.res_date} (${row.slot}) was ${label[data.status]}.`,
        "/court-booking",
      );
    } else if (data.res_date || data.slot) {
      await notify(
        context.supabase,
        row.user_id,
        "Court reservation rescheduled",
        `Your reservation was moved to ${data.res_date ?? row.res_date} (${data.slot ?? row.slot}).`,
        "/court-booking",
      );
    }
    return { ok: true as const };
  });

export const adminListBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("court_blocks")
      .select("*")
      .order("block_date", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSetBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        block_date: dateString,
        slot: z.string().max(20).nullable(),
        reason: z.string().trim().min(3, "Give a short reason.").max(200),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.slot && !isValidSlot(data.slot)) throw new Error("Choose a valid slot, or block the whole day.");
    const { error } = await context.supabase.from("court_blocks").insert({
      block_date: data.block_date,
      slot: data.slot,
      reason: data.reason,
      created_by: context.userId,
    });
    if (error) {
      if (error.code === "23505") throw new Error("That date and slot is already blocked.");
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const adminRemoveBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("court_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
