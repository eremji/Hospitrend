import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Copies the allowed addresses (ALLOWED_EMAILS + ADMIN_EMAILS) into the
 * `allowed_emails` table, which Row Level Security checks (SPEC US-01 CA2/CA3).
 * Addresses removed from the variables are removed from the table.
 * Needs the secret key. An empty list is ignored rather than locking everyone out.
 */
export async function syncAllowedEmails(db: SupabaseClient, emails: string[]): Promise<void> {
  const list = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (list.length === 0) {
    console.warn("[allowlist] ALLOWED_EMAILS is empty: allowed_emails left unchanged");
    return;
  }
  const { error: upsertError } = await db
    .from("allowed_emails")
    .upsert(list.map((email) => ({ email })), { onConflict: "email", ignoreDuplicates: true });
  if (upsertError) throw upsertError;

  const { data, error } = await db.from("allowed_emails").select("email");
  if (error) throw error;
  const stale = (data ?? []).map((r) => r.email as string).filter((e) => !list.includes(e));
  if (stale.length > 0) {
    const { error: deleteError } = await db.from("allowed_emails").delete().in("email", stale);
    if (deleteError) throw deleteError;
  }
}
