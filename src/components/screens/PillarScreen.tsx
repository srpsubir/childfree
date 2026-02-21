interface Props {
  onNext: (pillar: string) => void;
}

const pillars = [
  { id: "truth", title: "Truth" },
  { id: "autonomy", title: "Autonomy" },
  { id: "legacy", title: "Legacy" },
];

const PillarScreen = ({ onNext }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-12 animate-fade-up">
        <div className="space-y-4 text-center">
          <p className="gallery-label">Step IV</p>
          <h2 className="gallery-heading text-4xl font-semibold text-foreground">
            Define your lifestyle pillar.
          </h2>
        </div>

        <div className="space-y-3 animate-fade-up-delay">
          {pillars.map((p) => (
            <button
              key={p.id}
              onClick={() => onNext(p.id)}
              className="w-full border border-border bg-card p-6 text-left transition-all hover:border-primary"
            >
              <h3 className="gallery-heading text-xl text-foreground">{p.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PillarScreen;
