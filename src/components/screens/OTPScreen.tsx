import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface Props {
  onNext: () => void;
}

const OTPScreen = ({ onNext }: Props) => {
  const [value, setValue] = useState("");

  const handleChange = (val: string) => {
    setValue(val);
    if (val.length === 6) {
      setTimeout(onNext, 600);
    }
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
            Enter the code sent to your connected device to verify identity ownership.
          </p>
        </div>

        <div className="flex justify-center animate-fade-up-delay">
          <InputOTP maxLength={6} value={value} onChange={handleChange}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-14 text-lg border-border bg-card text-foreground" />
              <InputOTPSlot index={1} className="w-12 h-14 text-lg border-border bg-card text-foreground" />
              <InputOTPSlot index={2} className="w-12 h-14 text-lg border-border bg-card text-foreground" />
              <InputOTPSlot index={3} className="w-12 h-14 text-lg border-border bg-card text-foreground" />
              <InputOTPSlot index={4} className="w-12 h-14 text-lg border-border bg-card text-foreground" />
              <InputOTPSlot index={5} className="w-12 h-14 text-lg border-border bg-card text-foreground" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <p className="gallery-label animate-fade-up-delay-2">
          Any 6 digits will proceed during beta.
        </p>
      </div>
    </div>
  );
};

export default OTPScreen;
