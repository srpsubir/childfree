import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onNext: (phone: string) => void;
}

const OTPScreen = ({ onNext }: Props) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async () => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    if (cleaned.length < 10) {
      setError("Enter a valid phone number with country code.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("send-otp", {
        body: { phone: cleaned },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      setSent(true);
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("non-2xx") || msg.includes("Failed to send")) {
        setError("Could not send SMS. Check your number and try again.");
      } else {
        setError(msg || "Failed to send code.");
      }
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("verify-otp", {
        body: { phone: phone.replace(/[^\d+]/g, ""), code },
      });
      if (fnErr) throw fnErr;
      if (data?.error && !data?.verified) {
        setError(data.error);
        return;
      }
      if (data?.verified) {
        setTimeout(() => onNext(phone.replace(/[^\d+]/g, "")), 400);
      } else {
        setError("Invalid or expired code.");
      }
    } catch (e: any) {
      setError(e.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCodeChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 animate-fade-up text-center">
        <div className="space-y-4">
          <p className="gallery-label">Step I</p>
          <h2 className="gallery-heading text-4xl font-semibold text-foreground">
            Verify Ownership.
          </h2>
          <p className="gallery-body text-muted-foreground max-w-sm mx-auto">
            {sent
              ? "Enter the 6-digit code sent to your phone."
              : "Enter your phone number to receive a verification code."}
          </p>
        </div>

        {!sent ? (
          <div className="space-y-4 animate-fade-up-delay">
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
              className="w-full bg-transparent border-b border-border px-2 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-center"
            />
            <button
              onClick={sendCode}
              disabled={sending || phone.replace(/[^\d+]/g, "").length < 10}
              className="w-full border border-primary bg-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-up-delay">
            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-14 w-12 items-center justify-center border text-lg font-body transition-all ${
                    i < code.length
                      ? "border-primary text-foreground"
                      : "border-border text-muted-foreground"
                  } bg-card`}
                >
                  {code[i] || ""}
                </div>
              ))}
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              className="sr-only"
              maxLength={6}
              aria-label="Verification code"
            />
            {/* Tap target to focus hidden input */}
            <div
              className="cursor-text"
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[aria-label="Verification code"]');
                input?.focus();
              }}
            >
              <p className="gallery-label">Tap here to type your code</p>
            </div>
            <button
              onClick={verifyCode}
              disabled={verifying || code.length !== 6}
              className="w-full border border-primary bg-transparent px-5 py-4 font-body text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {verifying ? "Verifying..." : "Verify"}
            </button>
            <button
              onClick={() => { setSent(false); setCode(""); setError(""); }}
              className="gallery-label text-muted-foreground hover:text-foreground transition-colors"
            >
              Use a different number
            </button>
          </div>
        )}

        {error && (
          <p className="font-body text-sm text-destructive animate-fade-up">{error}</p>
        )}
      </div>
    </div>
  );
};

export default OTPScreen;
