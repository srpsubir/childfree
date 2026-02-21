import { useState, useCallback } from "react";
import AuditScreen from "@/components/screens/AuditScreen";
import OTPScreen from "@/components/screens/OTPScreen";
import WhyScreen from "@/components/screens/WhyScreen";
import PillarScreen from "@/components/screens/PillarScreen";
import FilterScreen from "@/components/screens/FilterScreen";
import StackScreen from "@/components/screens/StackScreen";
import PledgeScreen from "@/components/screens/PledgeScreen";
import PulseScreen from "@/components/screens/PulseScreen";
import OutcomeScreen from "@/components/screens/OutcomeScreen";

type Screen = "audit" | "otp" | "why" | "pillar" | "filter" | "stack" | "pledge" | "pulse" | "outcome";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("audit");
  const [handle, setHandle] = useState("");
  const [why, setWhy] = useState("");
  const [pillar, setPillar] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [stack, setStack] = useState<[string, string, string]>(["", "", ""]);
  const [fadeKey, setFadeKey] = useState(0);

  const goTo = useCallback((s: Screen) => {
    setFadeKey((k) => k + 1);
    setScreen(s);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div key={fadeKey} className="screen-fade">
        {screen === "audit" && (
          <AuditScreen onNext={(h) => { setHandle(h); goTo("otp"); }} />
        )}
        {screen === "otp" && (
          <OTPScreen onNext={() => goTo("why")} />
        )}
        {screen === "why" && (
          <WhyScreen onNext={(w) => { setWhy(w); goTo("pillar"); }} />
        )}
        {screen === "pillar" && (
          <PillarScreen onNext={(p) => { setPillar(p); goTo("filter"); }} />
        )}
        {screen === "filter" && (
          <FilterScreen onNext={(f) => { setFilters(f); goTo("stack"); }} />
        )}
        {screen === "stack" && (
          <StackScreen onNext={(s) => { setStack(s); goTo("pledge"); }} />
        )}
        {screen === "pledge" && (
          <PledgeScreen onNext={() => goTo("pulse")} />
        )}
        {screen === "pulse" && (
          <PulseScreen onNext={() => goTo("outcome")} />
        )}
        {screen === "outcome" && (
          <OutcomeScreen handle={handle} why={why} pillar={pillar} />
        )}
      </div>
    </div>
  );
};

export default Index;
