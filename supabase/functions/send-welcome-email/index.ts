const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Kindred — The Berlin Table")}&dates=20250301T180000Z/20250301T210000Z&location=${encodeURIComponent("QBA, Oranienburger Str. 45, 10117 Berlin")}&details=${encodeURIComponent("One table. Six strangers. No small talk.\n\nYour seat has been confirmed.\n\nVenue: https://maps.app.goo.gl/mg9rYYWWQdxF83ey8")}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Kindred <onboarding@resend.dev>",
        to: [email],
        subject: "Your seat is confirmed — The Berlin Table",
        html: `
          <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #f5f5f4;">
            <div style="background: #171717; padding: 32px; border: 1px solid #2a2a2a;">
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0 0 16px;">
                The Berlin Table.
              </h1>
              <p style="color: #8a8a8a; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Hey ${name || "there"},<br/><br/>
                Your seat has been confirmed. One table. Six strangers. No small talk.
              </p>
              <div style="border-top: 1px solid #2a2a2a; padding-top: 16px; font-size: 13px; color: #8a8a8a;">
                <p style="margin: 4px 0;"><strong style="color: #f5f5f4;">When:</strong> Saturday, 1 March · 7:00 PM CET</p>
                <p style="margin: 4px 0;"><strong style="color: #f5f5f4;">Where:</strong> QBA, Oranienburger Str. 45, Berlin</p>
              </div>
              <a href="${calendarUrl}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #e8d5b7; color: #171717; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">
                Add to Calendar
              </a>
            </div>
          </div>
        `,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-welcome-email error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
