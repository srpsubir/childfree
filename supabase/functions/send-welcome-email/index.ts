const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export interface EventData {
  title: string;
  date: string; // ISO string
  venue: string;
  address: string;
  maps_link?: string;
}

// Fallback for standalone / test calls without event payload
const DEFAULT_EVENT: EventData = {
  title: "The Berlin Table",
  date: "2025-03-01T18:00:00Z",
  venue: "QBA",
  address: "Oranienburger Str. 45, 10117 Berlin",
  maps_link: "https://maps.app.goo.gl/mg9rYYWWQdxF83ey8",
};

export function buildCalendarUrl(event: EventData): string {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const details =
    `One table. Six strangers. No small talk.\n\nYour seat has been confirmed.` +
    (event.maps_link ? `\n\nVenue: ${event.maps_link}` : "");
  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${fmt(start)}/${fmt(end)}` +
    `&location=${encodeURIComponent(`${event.venue}, ${event.address}`)}` +
    `&details=${encodeURIComponent(details)}`
  );
}

export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("weekday")}, ${get("day")} ${get("month")} · ${get("hour")}:${get("minute")} CET`;
  } catch {
    return dateStr;
  }
}

export function buildEmailHtml(
  name: string | undefined,
  event: EventData,
  calendarUrl: string,
): string {
  const formattedDate = formatEventDate(event.date);
  return `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #f5f5f4;">
      <div style="background: #171717; padding: 32px; border: 1px solid #2a2a2a;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0 0 16px;">
          ${event.title}.
        </h1>
        <p style="color: #8a8a8a; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Hey ${name || "there"},<br/><br/>
          Your seat has been confirmed. One table. Six strangers. No small talk.
        </p>
        <div style="border-top: 1px solid #2a2a2a; padding-top: 16px; font-size: 13px; color: #8a8a8a;">
          <p style="margin: 4px 0;"><strong style="color: #f5f5f4;">When:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0;"><strong style="color: #f5f5f4;">Where:</strong> ${event.venue}, ${event.address}</p>
        </div>
        <a href="${calendarUrl}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #e8d5b7; color: #171717; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">
          Add to Calendar
        </a>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, name } = body;
    const event: EventData = body.event ?? DEFAULT_EVENT;

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

    const calendarUrl = buildCalendarUrl(event);
    const html = buildEmailHtml(name, event, calendarUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Kindred <onboarding@resend.dev>",
        to: [email],
        subject: `Your seat is confirmed — ${event.title}`,
        html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-welcome-email error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
