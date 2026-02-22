import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import LandingScreen from "@/components/screens/LandingScreen";
import AuditScreen from "@/components/screens/AuditScreen";
import OTPScreen from "@/components/screens/OTPScreen";
import WhyScreen from "@/components/screens/WhyScreen";
import PillarScreen from "@/components/screens/PillarScreen";
import FilterScreen from "@/components/screens/FilterScreen";
import StackScreen from "@/components/screens/StackScreen";
import PledgeScreen from "@/components/screens/PledgeScreen";
import PulseScreen from "@/components/screens/PulseScreen";
import OutcomeScreen from "@/components/screens/OutcomeScreen";

type Screen = "landing" | "audit" | "otp" | "why" | "pillar" | "filter" | "stack" | "pledge" | "pulse" | "outcome";

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed top-6 left-6 z-50 gallery-label flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
  >
    <span className="text-base leading-none">←</span> Back
  </button>
);

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [handle, setHandle] = useState("");
  const [phone, setPhone] = useState("");
  const [why, setWhy] = useState("");
  const [pillar, setPillar] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [stack, setStack] = useState<[string, string, string]>(["", "", ""]);
  const [fadeKey, setFadeKey] = useState(0);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const goTo = useCallback((s: Screen) => {
    setFadeKey((k) => k + 1);
    setScreen(s);
  }, []);

  const saveProfileAndMatch = useCallback(async () => {
    try {
      // Save profile
      await supabase.from("profiles").upsert(
        {
          handle,
          phone,
          why,
          pillar,
          filters,
          stack: stack as string[],
        },
        { onConflict: "handle" }
      );

      // Compute matches
      const { data } = await supabase.functions.invoke("compute-matches", {
        body: { handle },
      });
      if (data?.total !== undefined) {
        setMatchCount(data.total);
      }
    } catch (e) {
      console.error("Profile save/match error:", e);
    }
  }, [handle, phone, why, pillar, filters, stack]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div key={fadeKey} className="screen-fade">
        {screen === "landing" && (
          <LandingScreen onNext={() => goTo("audit")} />
        )}
        {screen === "audit" && (
          <><BackButton onClick={() => goTo("landing")} />
          <AuditScreen onNext={(h) => { setHandle(h); goTo("otp"); }} /></>
        )}
        {screen === "otp" && (
          <><BackButton onClick={() => goTo("audit")} />
          <OTPScreen onNext={(p) => { setPhone(p); goTo("why"); }} /></>
        )}
        {screen === "why" && (
          <><BackButton onClick={() => goTo("otp")} />
          <WhyScreen onNext={(w) => { setWhy(w); goTo("pillar"); }} /></>
        )}
        {screen === "pillar" && (
          <><BackButton onClick={() => goTo("why")} />
          <PillarScreen onNext={(p) => { setPillar(p); goTo("filter"); }} /></>
        )}
        {screen === "filter" && (
          <><BackButton onClick={() => goTo("pillar")} />
          <FilterScreen onNext={(f) => { setFilters(f); goTo("stack"); }} /></>
        )}
        {screen === "stack" && (
          <><BackButton onClick={() => goTo("filter")} />
          <StackScreen onNext={(s) => { setStack(s); goTo("pledge"); }} /></>
        )}
        {screen === "pledge" && (
          <><BackButton onClick={() => goTo("stack")} />
          <PledgeScreen onNext={() => goTo("pulse")} /></>
        )}
        {screen === "pulse" && (
          <PulseScreen onNext={() => { saveProfileAndMatch(); goTo("outcome"); }} />
        )}
        {screen === "outcome" && (
          <OutcomeScreen handle={handle} why={why} pillar={pillar} filters={filters} stack={stack} matchCount={matchCount} />
        )}
      </div>
    </div>
  );
};

export default Index;
