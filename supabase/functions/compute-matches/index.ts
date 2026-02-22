import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Weights
const W_FILTER = 0.4;
const W_STACK = 0.3;
const W_WHY = 0.2;
const W_PILLAR = 0.1;

function filterScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const shared = b.filter((f) => setA.has(f)).length;
  if (shared < 2) return 0; // minimum threshold
  const maxPossible = Math.max(a.length, b.length);
  return maxPossible > 0 ? shared / maxPossible : 0;
}

function stackScore(a: string[], b: string[]): number {
  let score = 0;
  // Same #1 = big bonus
  if (a[0] && b[0] && a[0] === b[0]) score += 0.5;
  // Overlap in top-3 (any order)
  const setA = new Set(a.slice(0, 3));
  const overlap = b.slice(0, 3).filter((s) => setA.has(s)).length;
  score += overlap * (0.5 / 3);
  return Math.min(score, 1);
}

function whyScore(a: string, b: string): number {
  return a === b ? 1 : 0;
}

function pillarScore(a: string, b: string): number {
  if (a === b) return 1;
  // Partial credit for any pillar combination
  return 0.3;
}

function computeScore(
  user: { why: string; pillar: string; filters: string[]; stack: string[] },
  other: { why: string; pillar: string; filters: string[]; stack: string[] }
): number {
  return (
    W_FILTER * filterScore(user.filters, other.filters) +
    W_STACK * stackScore(user.stack, other.stack) +
    W_WHY * whyScore(user.why, other.why) +
    W_PILLAR * pillarScore(user.pillar, other.pillar)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { handle } = await req.json();
    if (!handle) {
      return new Response(JSON.stringify({ error: "Handle required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch requesting user's profile
    const { data: userProfile, error: userErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("handle", handle)
      .single();

    if (userErr || !userProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all other profiles
    const { data: others, error: othersErr } = await supabase
      .from("profiles")
      .select("handle, why, pillar, filters, stack")
      .neq("handle", handle);

    if (othersErr) {
      console.error("Fetch others error:", othersErr);
      return new Response(JSON.stringify({ error: "Failed to fetch profiles" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Score each
    const scored = (others || [])
      .map((other) => ({
        handle: other.handle,
        score: computeScore(
          { why: userProfile.why, pillar: userProfile.pillar, filters: userProfile.filters || [], stack: userProfile.stack || [] },
          { why: other.why, pillar: other.pillar, filters: other.filters || [], stack: other.stack || [] }
        ),
      }))
      .filter((m) => m.score > 0.15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return new Response(
      JSON.stringify({ matches: scored, total: scored.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("compute-matches error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
