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
    <div className="flex min-h-screen flex-col items-center justify-center px-10 py-16">
      <div className="w-full max-w-md space-y-14 animate-fade-up">
        <div className="space-y-5 text-center">
          <h1 className="gallery-heading text-5xl md:text-6xl font-semibold text-foreground">
            Kindred
          </h1>
        </div>

        <div className="space-y-6 animate-fade-up-delay">
          <label className="gallery-micro block text-center leading-relaxed">
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
            className="editorial-input"
          />
          <button
            onClick={submit}
            disabled={!handle.trim()}
            className="editorial-btn-outline"
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
