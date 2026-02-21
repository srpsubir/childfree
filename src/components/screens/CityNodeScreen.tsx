interface Props {
  onNext: () => void;
}

const CityNodeScreen = ({ onNext }: Props) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 animate-fade-up text-center">
        <div className="space-y-4">
          <p className="gallery-label">Entry Protocol</p>
          <h1 className="gallery-heading text-4xl md:text-5xl font-semibold text-foreground">
            Select City Node
          </h1>
        </div>

        <div className="animate-fade-up-delay">
          <button
            onClick={onNext}
            className="w-full border border-border bg-card p-6 text-left transition-all hover:border-primary group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="gallery-heading text-xl text-foreground">Berlin</h3>
                <p className="mt-1 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Alpha Node
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>

        <p className="gallery-label animate-fade-up-delay-2">
          More cities coming soon.
        </p>
      </div>
    </div>
  );
};

export default CityNodeScreen;
