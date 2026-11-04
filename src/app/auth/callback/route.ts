import { NextResponse } from "next/server";
import { syncAllowedEmails } from "@/lib/allowlist";
import { allowedEmailList, isAllowedEmail } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

/** Google sends her back here after sign-in (SPEC US-01). */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?erreur=1`);

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?erreur=1`);

  if (!isAllowedEmail(data.user.email)) {
    // US-01 CA3: no data is kept for an account that is not on the list.
    await supabase.auth.signOut();
    try {
      await supabaseAdmin().auth.admin.deleteUser(data.user.id);
    } catch (e) {
      console.error("[auth] could not delete unauthorised user", e);
    }
    return NextResponse.redirect(`${origin}/acces-reserve`);
  }

  // The database only lets in addresses listed in `allowed_emails` (H1 of the audit):
  // make sure the list matches the variables before the first query.
  try {
    await syncAllowedEmails(supabaseAdmin(), allowedEmailList());
  } catch (e) {
    console.error("[auth] could not sync allowed_emails", e);
  }

  return NextResponse.redirect(`${origin}/`);
}
