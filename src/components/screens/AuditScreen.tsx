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
          <h1 className="gallery-heading text-5xl md:text-6xl font-semibold text-foreground">
            Kindred
          </h1>
        </div>

        <div className="space-y-4 animate-fade-up-delay">
          <label className="gallery-label block text-center">
            Identity verification required.
            <br />
            Your handle is only revealed to your confirmed table members.
          </label>
          <input
            type="text"
            placeholder="@instagram_handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full bg-transparent border-b border-border px-2 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={submit}
            disabled={!handle.trim()}
            className="w-full border border-primary bg-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Begin Audit
          </button>
        </div>

        <p className="gallery-body text-center text-xs text-muted-foreground animate-fade-up-delay-2">
          Your handle is your proof of lifestyle.
          <br />
          We check it so your dates don't have to.
        </p>
      </div>
    </div>
  );
};

export default AuditScreen;
