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
    "Reading your signal...",
    "Finding your people...",
    "Preparing your Table...",
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 md:px-10 py-16">
      <div className="relative flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute border border-primary/30"
            style={{
              width: 120 + i * 80,
              height: 120 + i * 80,
              animation: `integrity-pulse 2.5s ease-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
        <div
          className="absolute w-16 h-16 border border-primary/60"
          style={{ animation: "integrity-ring 2s ease-out infinite" }}
        />
        <div className="w-3 h-3 bg-primary" />
      </div>

      <div className="mt-28 text-center space-y-3">
        <p className="gallery-body text-foreground transition-opacity duration-800 ease-in-out">
          {messages[phase]}
        </p>
        <p className="gallery-micro">Kindred verification in progress</p>
        {phase === 2 && (
          <p className="gallery-body text-sm text-muted-foreground/70 mt-6 transition-opacity duration-800 ease-in-out animate-fade-up">
            Preparing your Table — a private circle of people matched to your conviction and values. You'll meet in person.
          </p>
        )}
      </div>
    </div>
  );
};

export default PulseScreen;
