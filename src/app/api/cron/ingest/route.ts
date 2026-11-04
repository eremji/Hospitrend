import { timingSafeEqual } from "node:crypto";
import { syncAllowedEmails } from "@/lib/allowlist";
import { allowedEmailList } from "@/lib/env";
import { runIngestion } from "@/lib/ingest/ingest";
import { supabaseIngestDeps } from "@/lib/ingest/supabaseDeps";
import { SOURCE_SEEDS } from "@/lib/sources";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Vercel Hobby allows one cron run per day (see vercel.json) and up to 300 s per run.
// runIngestion stops starting new sources after 240 s, so the log is always written.
export const maxDuration = 300;

function sameSecret(given: string | null, expected: string): boolean {
  const a = Buffer.from(given ?? "");
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Daily ingestion (SPEC US-19). Vercel Cron calls this route with
 * `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !sameSecret(request.headers.get("authorization"), secret)) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const db = supabaseAdmin();
    await syncAllowedEmails(db, allowedEmailList()).catch((e) => console.error("[allowlist] sync failed", e));
    const report = await runIngestion(supabaseIngestDeps(db), SOURCE_SEEDS);
    const failed = report.sources.filter((s) => s.error && !s.skipped).length;
    const skipped = report.sources.filter((s) => s.skipped).length;
    console.log(`[ingest] inserted=${report.inserted} purged=${report.purged} failedSources=${failed} skippedSources=${skipped}`);
    return Response.json(report);
  } catch (e) {
    console.error("[ingest] run failed", e);
    return Response.json({ error: "La collecte a échoué : voir les journaux Vercel." }, { status: 500 });
  }
}
