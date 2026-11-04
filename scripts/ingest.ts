/**
 * Runs the ingestion once from your computer:
 *   npm run ingest
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { runIngestion } from "../src/lib/ingest/ingest";
import { supabaseIngestDeps } from "../src/lib/ingest/supabaseDeps";
import { SOURCE_SEEDS } from "../src/lib/sources";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const report = await runIngestion(supabaseIngestDeps(db), SOURCE_SEEDS);

for (const s of report.sources) {
  const status = s.error ? `ERREUR ${s.error}` : `${s.inserted} nouveaux / ${s.fetched} lus (${s.via})`;
  console.log(`${s.source.padEnd(28)} ${status}`);
}
console.log(`\nTotal : ${report.inserted} articles ajoutés, ${report.purged} supprimés (plus de 30 jours).`);
