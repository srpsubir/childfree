import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";

interface Props {
  matchCount?: number | null;
}

const EVENT = {
  title: "Kindred — The Berlin Table",
  date: "Sat, 1 March",
  time: "7:00 PM CET",
  venue: "QBA, Berlin",
  address: "Oranienburger Str. 45, 10117 Berlin",
  mapsLink: "https://maps.app.goo.gl/mg9rYYWWQdxF83ey8",
  description: "One table. Six strangers. No small talk. Your seat has been confirmed.",
  // Google Calendar link: 1 March 2025, 19:00–22:00 CET (18:00–21:00 UTC)
  calendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Kindred — The Berlin Table")}&dates=20250301T180000Z/20250301T210000Z&location=${encodeURIComponent("QBA, Oranienburger Str. 45, 10117 Berlin")}&details=${encodeURIComponent("One table. Six strangers. No small talk.\n\nYour seat has been confirmed.\n\nVenue: https://maps.app.goo.gl/mg9rYYWWQdxF83ey8")}`,
};

const OutcomeScreen = ({ matchCount }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg space-y-12 animate-fade-up text-center">
        {/* Status Badge */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 border border-primary px-4 py-1.5 font-body text-[10px] uppercase tracking-[0.2em] text-primary animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Seat Confirmed
          </span>

          <h2 className="gallery-heading text-4xl md:text-5xl font-semibold text-foreground">
            The Berlin Table.
          </h2>

          <p className="gallery-body text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {EVENT.description}
          </p>
        </div>

        {/* Invitation Card */}
        <div className="border border-border bg-card p-8 space-y-0 text-left animate-fade-up-delay">
          {/* Date */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="gallery-label">Date</span>
            </div>
            <div className="text-right">
              <span className="font-body text-sm text-foreground">{EVENT.date}</span>
              <p className="font-body text-[11px] text-muted-foreground mt-0.5">{EVENT.time}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Location */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="gallery-label">Location</span>
            </div>
            <div className="text-right">
              <a
                href={EVENT.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                {EVENT.venue}
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                {EVENT.address}
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Seats */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="gallery-label">Seats</span>
            </div>
            <div className="text-right">
              <span className="font-body text-sm text-foreground">6</span>
              <p className="font-body text-[11px] text-muted-foreground mt-0.5">Matched by conviction</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <p className="gallery-label text-muted-foreground animate-fade-up-delay">
          {matchCount !== null && matchCount !== undefined && matchCount > 0
            ? `${matchCount} potential match${matchCount === 1 ? "" : "es"} found`
            : "Your table is being assembled"}
        </p>

        {/* CTA — Google Calendar */}
        <a
          href={EVENT.calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-primary text-primary-foreground px-5 py-4 font-body text-xs uppercase tracking-[0.3em] transition-all hover:opacity-90 animate-fade-up-delay-2 text-center"
        >
          Add to Google Calendar
        </a>
      </div>
    </div>
  );
};

export default OutcomeScreen;
