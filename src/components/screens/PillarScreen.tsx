import { useState } from "react";

interface Props {
  onNext: (pillar: string) => void;
}

const pillars = [
  { id: "truth", title: "Truth", desc: "You live unfiltered. No performance, no pretense — just radical honesty about who you are." },
  { id: "autonomy", title: "Autonomy", desc: "Your life, your rules. You design every day without permission or compromise." },
  { id: "legacy", title: "Legacy", desc: "What you leave behind is defined by impact, not bloodline." },
];

const PillarScreen = ({ onNext }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 md:px-10 py-16">
      <div className="w-full max-w-lg space-y-12 animate-fade-up">
        <div className="space-y-5 text-center">
          <p className="gallery-micro">Step 2</p>
          <h2 className="gallery-heading text-3xl sm:text-4xl font-semibold text-foreground">
            Define your lifestyle pillar.
          </h2>
        </div>

        <div className="space-y-3 animate-fade-up-delay">
          {pillars.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`editorial-card w-full p-6 md:p-8 text-left ${
                selected === p.id ? "selected" : "hover:border-muted-foreground/30"
              }`}
            >
              <h3 className="gallery-heading text-xl text-foreground">{p.title}</h3>
              <p className="mt-2 gallery-body text-sm text-muted-foreground">{p.desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="editorial-btn-outline animate-fade-up-delay-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PillarScreen;
