import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

function buildMutualMatchEmail(
  recipientHandle: string,
  matchHandle: string,
  matchEmail: string,
): string {
  return `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #f5f5f4;">
      <div style="background: #171717; padding: 32px; border: 1px solid #2a2a2a;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0 0 16px;">
          Mutual connection.
        </h1>
        <p style="color: #8a8a8a; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Hey @${recipientHandle},<br/><br/>
          You and <strong style="color: #f5f5f4;">@${matchHandle}</strong> have both expressed interest in connecting. Here's how to reach them:
        </p>
        <div style="border-top: 1px solid #2a2a2a; padding-top: 16px; font-size: 13px; color: #8a8a8a;">
          <p style="margin: 4px 0;"><strong style="color: #f5f5f4;">Handle:</strong> @${matchHandle}</p>
          <p style="margin: 4px 0;"><strong style="color: #f5f5f4;">Email:</strong> ${matchEmail}</p>
        </div>
      </div>
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Kindred <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  return res;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requester_id, target_id, event_id } = await req.json();

    if (!requester_id || !target_id || !event_id) {
      return new Response(
        JSON.stringify({ error: "requester_id, target_id, and event_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check if the reverse request exists (making it mutual)
    const { data: reverseRequest, error: reverseError } = await supabase
      .from("connect_requests")
      .select("id")
      .eq("requester_id", target_id)
      .eq("target_id", requester_id)
      .eq("event_id", event_id)
      .maybeSingle();

    if (reverseError) {
      console.error("Error checking reverse request:", reverseError);
      return new Response(
        JSON.stringify({ error: reverseError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!reverseRequest) {
      // Not mutual yet — nothing to do
      return new Response(
        JSON.stringify({ mutual: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch both users' profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, handle, email")
      .in("user_id", [requester_id, target_id]);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: profilesError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const requesterProfile = profiles?.find((p) => p.user_id === requester_id);
    const targetProfile = profiles?.find((p) => p.user_id === target_id);

    if (!requesterProfile || !targetProfile) {
      return new Response(
        JSON.stringify({ error: "Could not find one or both user profiles" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping emails");
      return new Response(
        JSON.stringify({ mutual: true, skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results: { requester?: unknown; target?: unknown } = {};

    // Email the requester about their match (the target)
    if (requesterProfile.email && requesterProfile.handle && targetProfile.handle && targetProfile.email) {
      const res1 = await sendEmail(
        requesterProfile.email,
        "You have a mutual connection",
        buildMutualMatchEmail(requesterProfile.handle, targetProfile.handle, targetProfile.email),
      );
      results.requester = await res1.json();
    }

    // Email the target about their match (the requester)
    if (targetProfile.email && targetProfile.handle && requesterProfile.handle && requesterProfile.email) {
      const res2 = await sendEmail(
        targetProfile.email,
        "You have a mutual connection",
        buildMutualMatchEmail(targetProfile.handle, requesterProfile.handle, requesterProfile.email),
      );
      results.target = await res2.json();
    }

    return new Response(
      JSON.stringify({ mutual: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("notify-mutual-match error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
