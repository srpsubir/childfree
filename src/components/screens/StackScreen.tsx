import { useState } from "react";

interface Props {
  onNext: (stack: [string, string, string]) => void;
}

const values = [
  { id: "freedom", title: "Freedom", subtitle: "No permission needed. Ever." },
  { id: "financial", title: "Financial Independence", subtitle: "Your money. Your legacy." },
  { id: "solitude", title: "Solitude", subtitle: "Alone is not lonely." },
  { id: "mobility", title: "Mobility", subtitle: "Anywhere. Anytime." },
  { id: "purpose", title: "Purpose", subtitle: "Built for meaning, not obligation." },
];

const StackScreen = ({ onNext }: Props) => {
  const [ranked, setRanked] = useState<string[]>([]);

  const toggle = (id: string) => {
    setRanked((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start sm:justify-center px-6 md:px-10 pt-20 sm:pt-16 pb-10 sm:pb-16">
      <div className="w-full max-w-lg space-y-12 animate-fade-up">
        <div className="space-y-5 text-center">
          <p className="gallery-micro">Step 4</p>
          <h2 className="gallery-heading text-3xl sm:text-4xl font-semibold text-foreground">
            Rank what matters most for your childfree life.
          </h2>
          <p className="gallery-body text-muted-foreground">
            What drives your decision? Tap your top 3, in order.
          </p>
        </div>

        <div className="space-y-3 animate-fade-up-delay">
          {values.map((v) => {
            const rankIndex = ranked.indexOf(v.id);
            const isSelected = rankIndex !== -1;
            return (
              <button
                key={v.id}
                onClick={() => toggle(v.id)}
                className={`editorial-card relative w-full p-4 sm:p-5 md:p-7 text-left ${
                  isSelected ? "selected" : "hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="gallery-heading text-lg text-foreground">{v.title}</h3>
                    <p className="gallery-body mt-1 text-sm text-muted-foreground">{v.subtitle}</p>
                  </div>
                  {isSelected && (
                    <span className="flex h-8 w-8 items-center justify-center border border-primary text-sm font-semibold text-primary">
                      {rankIndex + 1}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => ranked.length === 3 && onNext(ranked as [string, string, string])}
          disabled={ranked.length !== 3}
          className="editorial-btn-outline animate-fade-up-delay-2"
        >
          Continue
        </button>

        <p className="gallery-micro text-muted-foreground/60 text-center animate-fade-up-delay-2">
          Your answers shape the table you'll be seated at.
        </p>
      </div>
    </div>
  );
};

export default StackScreen;
