import { useState } from "react";

interface Props {
  onNext: (pillar: string) => void;
}

const pillars = [
  {
    id: "truth",
    title: "Truth",
    desc: "I reject the performance of parenthood. My honesty is my currency.",
  },
  {
    id: "autonomy",
    title: "Autonomy",
    desc: "My time, body, and future belong to me. Non-negotiable.",
  },
  {
    id: "legacy",
    title: "Legacy",
    desc: "I define what I leave behind. My impact transcends biology.",
  },
];

const PillarScreen = ({ onNext }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-12 animate-fade-up">
        <div className="space-y-4 text-center">
          <p className="gallery-label">Step II</p>
          <h2 className="gallery-heading text-4xl font-semibold text-foreground">
            Select Your Pillar
          </h2>
          <p className="gallery-body text-muted-foreground">
            What grounds your certainty?
          </p>
        </div>

        <div className="space-y-3 animate-fade-up-delay">
          {pillars.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`w-full border p-6 text-left transition-all ${
                selected === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <h3 className="gallery-heading text-xl text-foreground">{p.title}</h3>
              <p className="mt-2 font-body text-sm text-muted-foreground">{p.desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="w-full border border-primary bg-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed animate-fade-up-delay-2"
        >
          Confirm Pillar
        </button>
      </div>
    </div>
  );
};

export default PillarScreen;
