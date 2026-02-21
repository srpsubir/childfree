interface Props {
  handle: string;
  pillar: string;
}

const pillarLabels: Record<string, string> = {
  truth: "Truth",
  autonomy: "Autonomy",
  legacy: "Legacy",
};

const LedgerScreen = ({ handle, pillar }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10 animate-fade-up">
        <div className="text-center space-y-2">
          <p className="gallery-label">Membership Ledger</p>
          <h2 className="gallery-heading text-4xl font-semibold text-foreground">
            Welcome, Architect.
          </h2>
        </div>

        <div className="border border-border bg-card divide-y divide-border animate-fade-up-delay">
          {/* Handle */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Handle</span>
            <span className="font-body text-sm text-foreground">@{handle}</span>
          </div>
          {/* Status */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Status</span>
            <span className="inline-flex items-center gap-2 font-body text-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Vetted
            </span>
          </div>
          {/* Pillar */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Pillar</span>
            <span className="font-body text-sm text-foreground">
              {pillarLabels[pillar] || pillar}
            </span>
          </div>
          {/* Table */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Table</span>
            <span className="font-display text-sm italic text-foreground">
              The Mitte Table
            </span>
          </div>
          {/* Track */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Track</span>
            <span className="font-body text-sm text-muted-foreground">Architects</span>
          </div>
        </div>

        <div className="text-center space-y-4 animate-fade-up-delay-2">
          <div className="mx-auto h-px w-16 bg-primary" />
          <p className="gallery-body text-xs text-muted-foreground">
            Your certainty has been archived.
            <br />
            The table is set. The conversation begins.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LedgerScreen;
