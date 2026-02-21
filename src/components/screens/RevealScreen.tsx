interface Props {
  onNext: () => void;
}

const RevealScreen = ({ onNext }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-12 animate-fade-up text-center">
        <div className="space-y-2">
          <p className="gallery-label">You're Verified</p>
          <h2 className="gallery-heading text-4xl md:text-5xl font-semibold text-foreground animate-text-reveal">
            The Mitte Table
          </h2>
        </div>

        <div className="border border-border bg-card p-8 space-y-6 animate-fade-up-delay">
          <p className="gallery-body text-foreground/80 text-lg leading-relaxed">
            You've been matched to an intimate dinner table with 5 other verified
            childfree singles. Real people. Real conversation. No ambiguity about
            where they stand.
          </p>
          <div className="h-px w-full bg-border" />
          <p className="gallery-body text-sm text-muted-foreground">
            Berlin — Date announced soon
          </p>
        </div>

        <button
          onClick={onNext}
          className="w-full border border-primary bg-primary px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary-foreground transition-all hover:bg-transparent hover:text-primary animate-fade-up-delay-2"
        >
          Claim Your Seat
        </button>
      </div>
    </div>
  );
};

export default RevealScreen;
