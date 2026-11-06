import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requestSchema, dateString } from "@/lib/validation";
import { z } from "zod";

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

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(prefix: string) {
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `${prefix}-${out}`;
}

export const submitRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("status")
      .eq("id", context.userId)
      .single();
    if (profile?.status !== "approved") {
      throw new Error("Your account must be approved before filing a request.");
    }

    const { data: service } = await context.supabase
      .from("services")
      .select("id, code, enabled, name")
      .eq("id", data.service_id)
      .single();
    if (!service) throw new Error("Choose a valid service.");
    if (!service.enabled) throw new Error("This service is currently unavailable.");

    // no duplicate active entries for the same service
    const { data: dup } = await context.supabase
      .from("service_requests")
      .select("code")
      .eq("user_id", context.userId)
      .eq("service_id", data.service_id)
      .in("status", ["pending", "in_queue", "processing"])
      .maybeSingle();
    if (dup) {
      throw new Error(
        `You already have an active request for this service (reference ${dup.code}). Track it from My Account.`,
      );
    }

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: inserted, error } = await context.supabase
        .from("service_requests")
        .insert({ ...data, user_id: context.userId, code: makeCode(service.code) })
        .select("code")
        .single();
      if (!error) return { code: inserted!.code };
      if (error.code === "23505") lastError = error.message;
      else throw new Error(error.message);
    }
    throw new Error(lastError ?? "Could not file the request. Please try again.");
  });

export const getMyRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("service_requests")
      .select("*, service:services(name, fee, code)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const cancelMyRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("service_requests")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminListRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        status: z.string().optional(),
        from: dateString.optional(),
        to: dateString.optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let query = context.supabase
      .from("service_requests")
      .select("*, service:services(name, fee, code)")
      .order("created_at", { ascending: false });
    if (data.status) query = query.eq("status", data.status as "pending");
    if (data.from) query = query.gte("created_at", `${data.from}T00:00:00Z`);
    if (data.to) query = query.lte("created_at", `${data.to}T23:59:59Z`);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "in_queue", "processing", "completed", "rejected", "cancelled"]),
        reason: z.string().trim().max(500).optional(),
      })
      .refine(
        (d: { status: string; reason?: string | undefined }) =>
          d.status !== "rejected" || (d.reason ?? "").length >= 5,
        {
          message: "Give a rejection reason (at least 5 characters).",
        },
      )
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row } = await context.supabase
      .from("service_requests")
      .select("code, user_id")
      .eq("id", data.id)
      .single();
    if (!row) throw new Error("Request not found.");

    const { error } = await context.supabase
      .from("service_requests")
      .update({
        status: data.status,
        rejection_reason: data.status === "rejected" ? (data.reason ?? null) : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const label: Record<string, string> = {
      pending: "set back to Pending",
      in_queue: "placed In Queue",
      processing: "marked as Processing",
      completed: "completed and ready for pickup",
      rejected: "rejected",
      cancelled: "cancelled",
    };
    await notify(
      context.supabase,
      row.user_id,
      `Request ${row.code} ${data.status === "rejected" ? "rejected" : "updated"}`,
      data.status === "rejected"
        ? `Your request ${row.code} was rejected. Reason: ${data.reason ?? "Not specified."}`
        : `Your request ${row.code} was ${label[data.status]}.`,
      "/account",
    );
    return { ok: true as const };
  });
