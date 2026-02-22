interface Props {
  handle: string;
  why: string;
  pillar: string;
  filters: string[];
  stack: [string, string, string];
  matchCount?: number | null;
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

const filterLabels: Record<string, string> = {
  timeline_pressure: "Timeline pressure",
  maybe_someday: "'Maybe someday'",
  friends_disappeared: "Friends disappeared",
  change_your_mind: "'You'll change your mind'",
  phase: "Childfree as a phase",
  workplace_penalty: "Workplace penalty",
  child_events: "Child-centric events",
  purpose_parenthood: "Purpose = parenthood",
};

const stackLabels: Record<string, string> = {
  freedom: "Freedom",
  financial: "Financial Independence",
  solitude: "Solitude",
  mobility: "Mobility",
  purpose: "Purpose",
};

const OutcomeScreen = ({ handle, why, pillar, filters, stack, matchCount }: Props) => {
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
          {matchCount !== null && matchCount !== undefined && (
            <p className="gallery-label text-primary animate-fade-up-delay">
              {matchCount > 0
                ? `${matchCount} potential match${matchCount === 1 ? "" : "es"} found`
                : "Your table is being assembled"}
            </p>
          )}
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

            <div className="h-px bg-border" />

            <div>
              <span className="gallery-label">The Filter</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {filters.map((f) => (
                  <span key={f} className="border border-border px-3 py-1 font-body text-xs text-muted-foreground">
                    {filterLabels[f] || f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="gallery-label">The Stack</span>
              <div className="mt-2 space-y-1">
                {stack.map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center border border-primary text-xs font-semibold text-primary">{i + 1}</span>
                    <span className="font-body text-sm text-foreground">{stackLabels[s] || s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

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
