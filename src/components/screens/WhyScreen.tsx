import { useState } from "react";

interface Props {
  onNext: (why: string) => void;
}

const options = [
  {
    id: "design",
    title: "By Design",
    desc: "I've always known. Kids were never part of my plan.",
  },
  {
    id: "realisation",
    title: "By Realisation",
    desc: "I came to it over time. The more I lived, the clearer it became.",
  },
  {
    id: "priority",
    title: "By Priority",
    desc: "I chose freedom, career, or purpose — and parenthood doesn't fit.",
  },
];

const WhyScreen = ({ onNext }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg space-y-10 animate-fade-up">
        <div className="space-y-4 text-center">
          <p className="gallery-label">Step 1</p>
          <h2 className="gallery-heading text-3xl sm:text-4xl font-semibold text-foreground">
            Why are you childfree?
          </h2>
          <p className="gallery-body text-muted-foreground">
            No wrong answers. This is about your truth.
          </p>
        </div>

        <div className="space-y-3 animate-fade-up-delay">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className={`w-full border p-6 text-left transition-all ${
                selected === o.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <h3 className="gallery-heading text-xl text-foreground">{o.title}</h3>
              <p className="mt-2 font-body text-sm text-muted-foreground">{o.desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="w-full border border-primary bg-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed animate-fade-up-delay-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WhyScreen;
