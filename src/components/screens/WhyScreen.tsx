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
    <div className="flex min-h-screen flex-col items-center justify-start sm:justify-center px-6 md:px-10 pt-20 sm:pt-16 pb-10 sm:pb-16">
      <div className="w-full max-w-lg space-y-12 animate-fade-up">
        <div className="space-y-5 text-center">
          <p className="gallery-micro">Step 1</p>
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
              className={`editorial-card w-full p-6 md:p-8 text-left ${
                selected === o.id ? "selected" : "hover:border-muted-foreground/30"
              }`}
            >
              <h3 className="gallery-heading text-xl text-foreground">{o.title}</h3>
              <p className="mt-2 gallery-body text-sm text-muted-foreground">{o.desc}</p>
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

export default WhyScreen;
