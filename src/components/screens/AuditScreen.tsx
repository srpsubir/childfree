import { useState } from "react";

interface Props {
  onNext: (handle: string) => void;
}

const AuditScreen = ({ onNext }: Props) => {
  const [handle, setHandle] = useState("");

  const submit = () => {
    if (handle.trim()) onNext(handle.trim().replace(/^@/, ""));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 animate-fade-up">
        <div className="space-y-4 text-center">
          <p className="gallery-label">Est. 2026</p>
          <h1 className="gallery-heading text-5xl md:text-6xl font-semibold text-foreground">
            Kindred
          </h1>
          <div className="mx-auto h-px w-16 bg-primary" />
          <p className="gallery-body text-lg text-muted-foreground">
            The Certainty Archive
          </p>
        </div>

        <div className="space-y-4 animate-fade-up-delay">
          <label className="gallery-label block text-center">
            Lifestyle Verification
          </label>
          <div className="border border-border bg-card">
            <input
              type="text"
              placeholder="@instagram_handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full bg-transparent px-5 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={submit}
            disabled={!handle.trim()}
            className="w-full border border-primary bg-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Begin Audit
          </button>
        </div>

        <p className="gallery-body text-center text-xs text-muted-foreground animate-fade-up-delay-2">
          Your handle serves as a lifestyle resume.
          <br />
          No login. No passwords. Just proof.
        </p>
      </div>
    </div>
  );
};

export default AuditScreen;
