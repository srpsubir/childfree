import { useState, useCallback } from "react";
import AuditScreen from "@/components/screens/AuditScreen";
import PillarScreen from "@/components/screens/PillarScreen";
import PledgeScreen from "@/components/screens/PledgeScreen";
import PulseScreen from "@/components/screens/PulseScreen";
import RevealScreen from "@/components/screens/RevealScreen";
import LedgerScreen from "@/components/screens/LedgerScreen";

type Screen = "audit" | "pillar" | "pledge" | "pulse" | "reveal" | "ledger";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("audit");
  const [handle, setHandle] = useState("");
  const [pillar, setPillar] = useState("");

  const goTo = useCallback((s: Screen) => setScreen(s), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {screen === "audit" && (
        <AuditScreen onNext={(h) => { setHandle(h); goTo("pillar"); }} />
      )}
      {screen === "pillar" && (
        <PillarScreen onNext={(p) => { setPillar(p); goTo("pledge"); }} />
      )}
      {screen === "pledge" && (
        <PledgeScreen onNext={() => goTo("pulse")} />
      )}
      {screen === "pulse" && (
        <PulseScreen onNext={() => goTo("reveal")} />
      )}
      {screen === "reveal" && (
        <RevealScreen onNext={() => goTo("ledger")} />
      )}
      {screen === "ledger" && (
        <LedgerScreen handle={handle} pillar={pillar} />
      )}
    </div>
  );
};

export default Index;
