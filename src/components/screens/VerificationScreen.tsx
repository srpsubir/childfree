import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  userId: string;
  onVerified: () => void;
}

const VerificationScreen = ({ userId, onVerified }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setErrorMsg("");
  };

  const handleVerify = async () => {
    if (!file) return;
    setStatus("uploading");

    try {
      const { error: uploadError } = await supabase.storage
        .from("verification-photos")
        .upload(`${userId}/selfie.jpg`, file, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw new Error(uploadError.message);

      setStatus("verifying");

      const { data, error: fnError } = await supabase.functions.invoke("verify-identity", {
        body: { user_id: userId },
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.verified) {
        setStatus("success");
        setTimeout(onVerified, 1500);
      } else {
        setStatus("error");
        setErrorMsg("No face detected. Try again with a clearer photo.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const retry = () => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <h1 className="gallery-heading mb-3 text-center">Prove You're Real.</h1>
      <p className="gallery-body text-muted-foreground mb-10 max-w-sm text-center">
        One photo. No filters. This is how trust begins.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFile}
      />

      {status === "success" ? (
        <div className="flex flex-col items-center gap-4 animate-fade-up">
          <CheckCircle className="w-16 h-16 text-primary" />
          <span className="gallery-label text-primary">Verified</span>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-48 h-48 md:w-64 md:h-64 border border-primary/20 flex flex-col items-center justify-center gap-3 transition-colors hover:border-primary/50 mb-8 overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="Selfie preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-10 h-10 text-muted-foreground" />
                <span className="gallery-label text-muted-foreground">Tap to take a photo</span>
              </>
            )}
          </button>

          {status === "error" && (
            <div className="flex items-center gap-2 text-destructive mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="gallery-label">{errorMsg}</span>
            </div>
          )}

          {file && status !== "uploading" && status !== "verifying" && (
            <div className="flex flex-col gap-3 items-center">
              <button onClick={handleVerify} className="editorial-btn-filled">
                Verify
              </button>
              {status === "error" && (
                <button onClick={retry} className="editorial-btn-outline">
                  Retake Photo
                </button>
              )}
            </div>
          )}

          {(status === "uploading" || status === "verifying") && (
            <span className="gallery-label animate-pulse text-muted-foreground">
              {status === "uploading" ? "Uploading…" : "Verifying…"}
            </span>
          )}
        </>
      )}
    </section>
  );
};

export default VerificationScreen;
