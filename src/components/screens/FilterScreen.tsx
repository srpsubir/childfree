import { useState } from "react";

interface Props {
  onNext: (filters: string[]) => void;
}

const aversions = [
  { id: "timeline_pressure", label: "Timeline pressure from family" },
  { id: "maybe_someday", label: "Partners who say 'maybe someday'" },
  { id: "friends_disappeared", label: "Friends who disappeared after kids" },
  { id: "change_your_mind", label: "Being told you'll change your mind" },
  { id: "phase", label: "Dates who treat childfree as a phase" },
  { id: "workplace_penalty", label: "Workplaces that penalize the childless" },
  { id: "child_events", label: "Social events built around children" },
  { id: "purpose_parenthood", label: "The assumption that purpose requires parenthood" },
];

const FilterScreen = ({ onNext }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg space-y-10 animate-fade-up">
        <div className="space-y-4 text-center">
          <p className="gallery-label">Step 3</p>
          <h2 className="gallery-heading text-3xl sm:text-4xl font-semibold text-foreground">
            What you refuse to tolerate.
          </h2>
          <p className="gallery-body text-muted-foreground">
            Select all that apply. Honesty sharpens your match.
          </p>
        </div>

        <div className="space-y-2 animate-fade-up-delay">
          {aversions.map((a) => {
            const isSelected = selected.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                className={`w-full border p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <span className="gallery-body text-sm">{a.label}</span>
              </button>
            );
          })}
        </div>

        <div className="animate-fade-up-delay-2">
          <button
            disabled={selected.length < 2}
            onClick={() => onNext(selected)}
            className="w-full border border-primary bg-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          {selected.length < 2 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Select at least 2 to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterScreen;
