/** Environment helpers. Secrets never leave the server. */

export function supabaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set (see .env.example)");
  return v;
}

export function supabasePublishableKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set (see .env.example)");
  return v;
}

function emailList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Every allowed address (ALLOWED_EMAILS + ADMIN_EMAILS), lower-case, without duplicates. */
export function allowedEmailList(): string[] {
  return [...new Set([...emailList(process.env.ALLOWED_EMAILS), ...emailList(process.env.ADMIN_EMAILS)])];
}

/** SPEC US-01 CA2/CA3: only listed Google accounts may use the app. */
export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  return emailList(process.env.ALLOWED_EMAILS).includes(e) || isAdminEmail(e);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return emailList(process.env.ADMIN_EMAILS).includes(email.toLowerCase());
}
