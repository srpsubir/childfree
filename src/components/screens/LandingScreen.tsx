interface Props {
  onNext: () => void;
}

const LandingScreen = ({ onNext }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-16 text-center animate-fade-up">
        <h1 className="gallery-heading text-5xl sm:text-6xl font-semibold text-foreground tracking-tight">
          Kindred
        </h1>

        <div className="space-y-2">
          <p className="gallery-heading text-xl sm:text-2xl text-foreground/80 leading-relaxed">
            Done explaining.<br />
            Done compromising.<br />
            Done searching.
          </p>
        </div>

        <p className="gallery-body text-muted-foreground leading-relaxed animate-fade-up-delay">
          Find childfree partners who mean it.<br />
          Matched by conviction, not luck.<br />
          No ambiguity. No bait-and-switch.
        </p>

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
