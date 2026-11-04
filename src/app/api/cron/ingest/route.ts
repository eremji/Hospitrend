import { runIngestion } from "@/lib/ingest/ingest";
import { supabaseIngestDeps } from "@/lib/ingest/supabaseDeps";
import { SOURCE_SEEDS } from "@/lib/sources";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Vercel Hobby allows one cron run per day: see vercel.json.
export const maxDuration = 60;

/**
 * Daily ingestion (SPEC US-19). Vercel Cron calls this route with
 * `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const report = await runIngestion(supabaseIngestDeps(supabaseAdmin()), SOURCE_SEEDS);
    const failed = report.sources.filter((s) => s.error).length;
    console.log(`[ingest] inserted=${report.inserted} purged=${report.purged} failedSources=${failed}`);
    return Response.json(report);
  } catch (e) {
    console.error("[ingest] run failed", e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
