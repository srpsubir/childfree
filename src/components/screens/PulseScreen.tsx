import { useEffect, useState } from "react";

interface Props {
  onNext: () => void;
}

const PulseScreen = ({ onNext }: Props) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2500);
    const t2 = setTimeout(() => setPhase(2), 5000);
    const t3 = setTimeout(onNext, 7500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onNext]);

  const messages = [
    "Authenticating intent...",
    "Filtering for ambiguity...",
    "Finalizing table placement...",
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="relative flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary/30"
            style={{
              width: 120 + i * 80,
              height: 120 + i * 80,
              animation: `integrity-pulse 2.5s ease-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
        <div
          className="absolute w-16 h-16 rounded-full border border-primary/60"
          style={{ animation: "integrity-ring 2s ease-out infinite" }}
        />
        <div className="w-3 h-3 rounded-full bg-primary" />
      </div>

      <div className="mt-24 text-center space-y-2">
        <p className="gallery-body text-foreground transition-opacity duration-500">
          {messages[phase]}
        </p>
        <p className="gallery-label">Kindred verification in progress</p>
        {phase === 2 && (
        <p className="gallery-body text-sm text-muted-foreground/70 mt-4 transition-opacity duration-700 animate-fade-up">
            Preparing your Table — a private circle of people matched to your conviction and values. You'll meet in person.
          </p>
        )}
      </div>
    </div>
  );
};

export default PulseScreen;
