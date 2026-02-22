import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Scoring (same weights as compute-matches) ──────────────────────────
const W_FILTER = 0.4;
const W_STACK = 0.3;
const W_WHY = 0.2;
const W_PILLAR = 0.1;

function filterScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const shared = b.filter((f) => setA.has(f)).length;
  if (shared < 2) return 0;
  const maxPossible = Math.max(a.length, b.length);
  return maxPossible > 0 ? shared / maxPossible : 0;
}

function stackScore(a: string[], b: string[]): number {
  let score = 0;
  if (a[0] && b[0] && a[0] === b[0]) score += 0.5;
  const setA = new Set(a.slice(0, 3));
  const overlap = b.slice(0, 3).filter((s) => setA.has(s)).length;
  score += overlap * (0.5 / 3);
  return Math.min(score, 1);
}

function whyScore(a: string, b: string): number {
  return a === b ? 1 : 0;
}

function pillarScore(a: string, b: string): number {
  return a === b ? 1 : 0.3;
}

interface Profile {
  id: string;
  handle: string;
  why: string;
  pillar: string;
  filters: string[];
  stack: string[];
}

function computeScore(a: Profile, b: Profile): number {
  return (
    W_FILTER * filterScore(a.filters || [], b.filters || []) +
    W_STACK * stackScore(a.stack || [], b.stack || []) +
    W_WHY * whyScore(a.why, b.why) +
    W_PILLAR * pillarScore(a.pillar, b.pillar)
  );
}

// ── Greedy table clustering ────────────────────────────────────────────
function clusterTables(profiles: Profile[], tableSize = 6): Profile[][] {
  const tables: Profile[][] = [];
  const assigned = new Set<string>();

  // Pre-compute pairwise scores
  const scores = new Map<string, number>();
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const key = `${profiles[i].id}|${profiles[j].id}`;
      scores.set(key, computeScore(profiles[i], profiles[j]));
    }
  }

  const getScore = (a: string, b: string): number => {
    const k1 = `${a}|${b}`;
    const k2 = `${b}|${a}`;
    return scores.get(k1) ?? scores.get(k2) ?? 0;
  };

  const unassigned = () => profiles.filter((p) => !assigned.has(p.id));

  while (unassigned().length >= tableSize) {
    const pool = unassigned();

    // Find highest-scoring pair as seeds
    let bestPair: [Profile, Profile] | null = null;
    let bestScore = -1;
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const s = getScore(pool[i].id, pool[j].id);
        if (s > bestScore) {
          bestScore = s;
          bestPair = [pool[i], pool[j]];
        }
      }
    }

    if (!bestPair) break;

    const table: Profile[] = [bestPair[0], bestPair[1]];
    assigned.add(bestPair[0].id);
    assigned.add(bestPair[1].id);

    // Greedily add members with highest avg compatibility to current table
    while (table.length < tableSize) {
      const candidates = unassigned();
      if (candidates.length === 0) break;

      let bestCandidate: Profile | null = null;
      let bestAvg = -1;

      for (const candidate of candidates) {
        const avg =
          table.reduce((sum, member) => sum + getScore(candidate.id, member.id), 0) /
          table.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestCandidate = candidate;
        }
      }

      if (!bestCandidate) break;
      table.push(bestCandidate);
      assigned.add(bestCandidate.id);
    }

    if (table.length === tableSize) {
      tables.push(table);
    }
  }

  return tables;
}

// ── HTTP handler ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Accept optional event_id from request body
    let eventId: string | null = null;
    try {
      const body = await req.json();
      eventId = body?.event_id ?? null;
    } catch {
      // No body is fine
    }

    // Fetch all unassigned profiles with complete data
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, handle, why, pillar, filters, stack, user_id")
      .is("table_id", null)
      .not("why", "is", null)
      .not("pillar", "is", null);

    if (error) {
      console.error("Fetch profiles error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch profiles" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profiles || profiles.length < 6) {
      return new Response(
        JSON.stringify({ message: "Not enough unassigned profiles", count: profiles?.length ?? 0, tables_created: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clusters = clusterTables(profiles as Profile[]);
    let tablesCreated = 0;

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];

      // Create the table record, optionally linked to an event
      const insertData: Record<string, unknown> = {
        name: `Berlin — ${String.fromCharCode(65 + tablesCreated)}`,
        city: "Berlin",
        status: "forming",
      };
      if (eventId) insertData.event_id = eventId;

      const { data: tableRecord, error: tableErr } = await supabase
        .from("tables")
        .insert(insertData)
        .select("id")
        .single();

      if (tableErr || !tableRecord) {
        console.error("Create table error:", tableErr);
        continue;
      }

      // Assign profiles to this table
      const ids = cluster.map((p) => p.id);
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ table_id: tableRecord.id, assigned_at: new Date().toISOString() })
        .in("id", ids);

      if (updateErr) {
        console.error("Assign profiles error:", updateErr);
        continue;
      }

      // If event_id provided, create invitations for each profile
      if (eventId) {
        const invitationRows = cluster
          .filter((p) => (p as Profile & { user_id?: string }).user_id)
          .map((p) => ({
            user_id: (p as Profile & { user_id: string }).user_id,
            event_id: eventId,
            status: "pending",
          }));

        if (invitationRows.length > 0) {
          const { error: invErr } = await supabase.from("invitations").insert(invitationRows);
          if (invErr) console.error("Create invitations error:", invErr);
        }
      }

      tablesCreated++;
    }

    return new Response(
      JSON.stringify({
        tables_created: tablesCreated,
        profiles_assigned: tablesCreated * 6,
        profiles_remaining: profiles.length - tablesCreated * 6,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("assign-tables error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
