import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { profileUpdateSchema, rejectReason, z } from "@/lib/validation";

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

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc("is_admin");
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data, isAdmin: !!admin };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileUpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminListAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSetAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        status: z.enum(["approved", "rejected", "suspended", "pending"]),
        reason: z.string().trim().max(500).optional(),
      })
      .refine(
        (d) => d.status !== "rejected" || (d.reason ?? "").length >= 5,
        { message: "Give a rejection reason (at least 5 characters)." },
      )
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("profiles")
      .update({
        status: data.status,
        rejection_reason: data.status === "rejected" ? (data.reason ?? null) : null,
      })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    if (data.status === "approved") {
      await notify(
        context.supabase,
        data.userId,
        "Account approved",
        "Your resident account has been approved. You can now file requests, book the court, and submit reports.",
        "/account",
      );
    } else if (data.status === "rejected") {
      await notify(
        context.supabase,
        data.userId,
        "Account not approved",
        `Your account was not approved. Reason: ${data.reason ?? "Not specified."}`,
        "/account",
      );
    } else if (data.status === "suspended") {
      await notify(
        context.supabase,
        data.userId,
        "Account deactivated",
        "Your account was deactivated by the barangay admin.",
      );
    }
    return { ok: true as const };
  });

export const adminUpdateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ userId: z.string().uuid() })
      .extend(profileUpdateSchema.shape)
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { userId, ...values } = data;
    const { error } = await context.supabase.from("profiles").update({ ...values, birthdate: values.birthdate ?? null }).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminCreateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().trim().email("Enter a valid email address.").max(255),
        password: z.string().min(8, "Password must be at least 8 characters.").max(72),
      })
      .extend(profileUpdateSchema.shape)
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created?.user) throw new Error(error?.message ?? "Could not create the account.");
    const { email: _omit2, password: _omit3, ...profile } = data;
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ ...profile, birthdate: profile.birthdate ?? null, status: "approved" })
      .eq("id", created.user.id);
    if (updateError) throw new Error(updateError.message);
    return { ok: true as const };
  });

export const adminDeleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const getDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ path: z.string().trim().min(3).max(400) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: signed, error } = await context.supabase.storage
      .from("uploads")
      .createSignedUrl(data.path, 600);
    if (error || !signed) throw new Error(error?.message ?? "Could not open the document.");
    return { url: signed.signedUrl };
  });
