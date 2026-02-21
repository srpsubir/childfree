interface Props {
  onNext: () => void;
}

const LandingScreen = ({ onNext }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-12 text-center animate-fade-up">
        <h1 className="gallery-heading text-5xl sm:text-6xl font-semibold text-foreground tracking-tight">
          Kindred
        </h1>

        <p className="gallery-heading text-xl sm:text-2xl text-foreground/80 leading-relaxed">
          Done explaining.<br />
          Done compromising.<br />
          Done searching.
        </p>

        <div className="space-y-4 animate-fade-up-delay">
          <p className="gallery-body text-muted-foreground">Find childfree partners who mean it.</p>
          <p className="gallery-body text-muted-foreground">Matched by conviction, not luck.</p>
          <p className="gallery-body text-muted-foreground">No ambiguity. No bait-and-switch.</p>
        </div>

        <div className="animate-fade-up-delay-2">
          <button
            onClick={onNext}
            className="border border-primary bg-primary/10 px-10 py-4 gallery-heading text-lg text-foreground transition-all hover:bg-primary/20"
          >
            Enter Kindred
          </button>
        </div>

        <p className="gallery-label text-muted-foreground/60">
          For the certain. By audit only.
        </p>
      </div>
    </div>
  );
};

export default LandingScreen;
