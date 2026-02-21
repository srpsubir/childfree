interface Props {
  handle: string;
  why: string;
  pillar: string;
}

const pillarLabels: Record<string, string> = {
  truth: "Truth",
  autonomy: "Autonomy",
  legacy: "Legacy",
};

const whyLabels: Record<string, string> = {
  design: "By Design",
  realisation: "By Realisation",
  priority: "By Priority",
};

const OutcomeScreen = ({ handle, why, pillar }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-16 animate-fade-up text-center">
        <div className="space-y-6">
          <p className="gallery-label">Placement Complete</p>
          <h2 className="gallery-heading text-4xl md:text-5xl font-semibold text-foreground">
            The Berlin Table.
          </h2>
          <p className="gallery-body text-muted-foreground max-w-md mx-auto leading-relaxed">
            For the architects of their own lives. You are matched with those who
            prioritize autonomy and vision over the expected path.
          </p>
        </div>

        {/* Ledger Card */}
        <div className="border border-border bg-card p-8 space-y-6 text-left animate-fade-up-delay">
          <div className="flex items-center justify-between">
            <p className="gallery-label">Kindred Ledger</p>
            <span className="inline-flex items-center gap-2 border border-primary px-3 py-1 font-body text-[10px] uppercase tracking-[0.2em] text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Intent Verified
            </span>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="gallery-label">Handle</span>
              <span className="font-body text-sm text-foreground">@{handle}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="gallery-label">Why</span>
              <span className="font-body text-sm text-foreground">{whyLabels[why] || why}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="gallery-label">Pillar</span>
              <span className="font-body text-sm text-foreground">{pillarLabels[pillar] || pillar}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="gallery-label">Table</span>
              <span className="font-body text-sm text-foreground">Berlin — Alpha</span>
            </div>
          </div>
        </div>

        <button className="w-full bg-primary text-primary-foreground px-5 py-4 font-body text-xs uppercase tracking-[0.3em] transition-all hover:opacity-90 animate-fade-up-delay-2">
          Claim Your Seat
        </button>
      </div>
    </div>
  );
};

export default OutcomeScreen;
