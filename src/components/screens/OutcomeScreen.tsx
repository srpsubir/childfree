import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Props {
  matchCount?: number | null;
  verified?: boolean;
  onSignOut?: () => void;
  userId?: string;
}

function buildCalendarUrl(event: { title: string; date: string; venue: string; address: string; maps_link: string | null }) {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const details = `One table. Six strangers. No small talk.\n\nYour seat has been confirmed.${event.maps_link ? `\n\nVenue: ${event.maps_link}` : ""}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(`${event.venue}, ${event.address}`)}&details=${encodeURIComponent(details)}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    display: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }),
  };
}

const OutcomeScreen = ({ matchCount, verified, onSignOut, userId }: Props) => {
  const navigate = useNavigate();
  const [event, setEvent] = useState<{
    title: string; date: string; venue: string; address: string; maps_link: string | null; max_seats: number;
  } | null>(null);

  useEffect(() => {
    const fetchFallback = () => {
      supabase
        .from("events")
        .select("title, date, venue, address, maps_link, max_seats")
        .eq("status", "upcoming")
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setEvent(data);
        });
    };

    if (userId) {
      supabase
        .from("invitations")
        .select("events(title, date, venue, address, maps_link, max_seats)")
        .eq("user_id", userId)
        .order("date", { foreignTable: "events", ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          const ev = data?.events as {
            title: string; date: string; venue: string; address: string; maps_link: string | null; max_seats: number;
          } | null;
          if (ev) {
            setEvent(ev);
          } else {
            fetchFallback();
          }
        });
    } else {
      fetchFallback();
    }
  }, [userId]);

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 md:px-10 py-16">
        <span className="gallery-micro animate-pulse">Loading event…</span>
      </div>
    );
  }

  const { display, time } = formatDate(event.date);
  const calendarUrl = buildCalendarUrl(event);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 md:px-10 py-16">
      <div className="w-full max-w-lg space-y-14 animate-fade-up text-center">
        {/* Status Badge */}
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 border border-primary px-5 py-2 gallery-micro text-primary animate-fade-up">
            <span className="w-1.5 h-1.5 bg-primary" />
            Seat Confirmed
          </span>

          {verified && (
            <span className="inline-flex items-center gap-1.5 gallery-micro text-primary animate-fade-up">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Identity Verified
            </span>
          )}

          <h2 className="gallery-heading text-2xl md:text-4xl font-semibold text-foreground">
            {event.title.replace("Kindred — ", "")}
          </h2>

          <p className="gallery-body text-muted-foreground max-w-sm mx-auto leading-relaxed">
            One table. Six strangers. No small talk. Your seat has been confirmed.
          </p>
        </div>

        {/* Invitation Card */}
        <div className="border border-border bg-card p-6 md:p-10 space-y-0 text-left animate-fade-up-delay">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="gallery-micro">Date</span>
            </div>
            <div className="text-right">
              <span className="gallery-body text-sm text-foreground">{display}</span>
              <p className="gallery-micro mt-1">{time}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="gallery-micro">Location</span>
            </div>
            <div className="text-right">
              <a
                href={event.maps_link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="gallery-body text-sm text-foreground hover:text-primary transition-colors duration-300 inline-flex items-center gap-1.5"
              >
                {event.venue}
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="gallery-micro mt-1">{event.address}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="gallery-micro">Seats</span>
            </div>
            <div className="text-right">
              <span className="gallery-body text-sm text-foreground">{event.max_seats}</span>
              <p className="gallery-micro mt-1">Matched by conviction</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <p className="gallery-micro text-muted-foreground animate-fade-up-delay">
          {matchCount !== null && matchCount !== undefined && matchCount > 0
            ? `${matchCount} potential match${matchCount === 1 ? "" : "es"} found`
            : "Your table is being assembled"}
        </p>

        {/* CTA — Google Calendar */}
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="editorial-btn-filled block text-center animate-fade-up-delay-2"
        >
          Add to Google Calendar
        </a>

        {/* View All + Sign Out */}
        <div className="flex items-center justify-center gap-8 animate-fade-up-delay-2">
          <button
            onClick={() => navigate("/account")}
            className="gallery-micro text-muted-foreground hover:text-foreground transition-colors duration-300 cursor-pointer"
          >
            My Tables
          </button>
          {onSignOut && (
            <>
              <span className="text-border">·</span>
              <button
                onClick={onSignOut}
                className="gallery-micro text-muted-foreground hover:text-foreground transition-colors duration-300 cursor-pointer"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutcomeScreen;
