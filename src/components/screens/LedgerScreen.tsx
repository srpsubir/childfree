interface Props {
  handle: string;
  why: string;
  pillar: string;
}

const pillarLabels: Record<string, string> = {
  freedom: "Freedom",
  ambition: "Ambition",
  connection: "Connection",
};

const whyLabels: Record<string, string> = {
  design: "By Design",
  realisation: "By Realisation",
  priority: "By Priority",
};

const LedgerScreen = ({ handle, why, pillar }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10 animate-fade-up">
        <div className="text-center space-y-2">
          <p className="gallery-label">Kindred Ledger</p>
          <h2 className="gallery-heading text-4xl font-semibold text-foreground">
            Welcome to Kindred.
          </h2>
        </div>

        <div className="border border-border bg-card divide-y divide-border animate-fade-up-delay">
          {/* Handle */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Handle</span>
            <span className="font-body text-sm text-foreground">@{handle}</span>
          </div>
          {/* Why */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Why</span>
            <span className="font-body text-sm text-foreground">
              {whyLabels[why] || why}
            </span>
          </div>
          {/* Status */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Status</span>
            <span className="inline-flex items-center gap-2 font-body text-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Vetted
            </span>
          </div>
          {/* Value */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Value</span>
            <span className="font-body text-sm text-foreground">
              {pillarLabels[pillar] || pillar}
            </span>
          </div>
          {/* Table */}
          <div className="flex items-center justify-between p-5">
            <span className="gallery-label">Table</span>
            <span className="font-display text-sm italic text-foreground">
              The Kindred Table — Berlin
            </span>
          </div>
        </div>

        <div className="text-center space-y-4 animate-fade-up-delay-2">
          <div className="mx-auto h-px w-16 bg-primary" />
          <p className="gallery-body text-xs text-muted-foreground">
            Your seat is reserved.
            <br />
            We'll notify you when your table date is confirmed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LedgerScreen;
