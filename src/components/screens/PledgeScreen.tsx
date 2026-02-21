import { useRef, useState, useCallback } from "react";

interface Props {
  onNext: () => void;
}

const PledgeScreen = ({ onNext }: Props) => {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HOLD_MS = 3000;
  const TICK = 30;

  const startHold = useCallback(() => {
    if (complete) return;
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += TICK;
      const pct = Math.min((elapsed / HOLD_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setComplete(true);
        setTimeout(onNext, 600);
      }
    }, TICK);
  }, [complete, onNext]);

  const endHold = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!complete) setProgress(0);
  }, [complete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-16 animate-fade-up text-center">
        <div className="space-y-6">
          <p className="gallery-label">The Pledge</p>
          <h2 className="gallery-heading text-3xl md:text-4xl font-semibold text-foreground leading-tight">
            I Am Certain.
          </h2>
          <p className="gallery-body text-muted-foreground max-w-sm mx-auto">
            I confirm a child-free life is my final decision. This is not a phase. This is architecture.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6 animate-fade-up-delay">
          <div className="relative">
            {/* progress ring */}
            <svg className="w-32 h-32" viewBox="0 0 128 128">
              <circle
                cx="64" cy="64" r="58"
                fill="none"
                className="stroke-border"
                strokeWidth="1"
              />
              <circle
                cx="64" cy="64" r="58"
                fill="none"
                className="stroke-primary"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.05s linear", transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            <button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              className={`absolute inset-0 flex items-center justify-center font-body text-xs uppercase tracking-[0.2em] transition-colors ${
                complete ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {complete ? "Sealed" : "Hold"}
            </button>
          </div>
          <p className="gallery-label">
            {complete ? "Pledge accepted." : "Press & hold for 3 seconds"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PledgeScreen;
