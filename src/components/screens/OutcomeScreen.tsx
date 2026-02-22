import { Calendar, MapPin, Users, Lock } from "lucide-react";

interface Props {
  matchCount?: number | null;
}

const OutcomeScreen = ({ matchCount }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
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
            One table. Six strangers. No small talk.
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
              <span className="font-body text-sm text-foreground">TBA</span>
              <p className="font-body text-[11px] text-muted-foreground mt-0.5">You'll be notified</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Location */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="gallery-label">Location</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="font-body text-sm text-foreground">Berlin</span>
                <p className="font-body text-[11px] text-muted-foreground mt-0.5 flex items-center justify-end gap-1">
                  <Lock className="h-3 w-3" />
                  Revealed 24h before
                </p>
              </div>
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

        {/* CTA */}
        <button className="w-full bg-primary text-primary-foreground px-5 py-4 font-body text-xs uppercase tracking-[0.3em] transition-all hover:opacity-90 animate-fade-up-delay-2">
          Claim Your Seat
        </button>
      </div>
    </div>
  );
};

export default OutcomeScreen;
