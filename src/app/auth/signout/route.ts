import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Sign-out from the Profile screen (SPEC US-01 CA5). */
export async function POST(request: Request) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
