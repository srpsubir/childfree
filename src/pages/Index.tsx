import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LandingScreen from "@/components/screens/LandingScreen";
import AuthGate from "@/components/AuthGate";
import WhyScreen from "@/components/screens/WhyScreen";
import PillarScreen from "@/components/screens/PillarScreen";
import FilterScreen from "@/components/screens/FilterScreen";
import StackScreen from "@/components/screens/StackScreen";
import PulseScreen from "@/components/screens/PulseScreen";
import OutcomeScreen from "@/components/screens/OutcomeScreen";

type Screen = "landing" | "auth" | "why" | "pillar" | "filter" | "stack" | "pulse" | "outcome";

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed top-6 left-6 z-50 gallery-label flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
  >
    <span className="text-base leading-none">←</span> Back
  </button>
);

const Index = () => {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>("landing");
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

  const handleLandingNext = useCallback(() => {
    goTo("why");
  }, [goTo]);

  const saveProfileAndMatch = useCallback(async () => {
    if (!user) {
      console.log("Skipping save — no user");
      return;
    }
    try {
      const email = user.email ?? "";
      const handle = email.split("@")[0]; // derive handle from email

      await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          email,
          handle,
          why,
          pillar,
          filters,
          stack: stack as string[],
        },
        { onConflict: "user_id" }
      );

      const { data } = await supabase.functions.invoke("compute-matches", {
        body: { handle },
      });
      if (data?.total !== undefined) {
        setMatchCount(data.total);
      }

      // Fire-and-forget welcome email
      supabase.functions.invoke("send-welcome-email", {
        body: { email, name: user.user_metadata?.full_name || handle },
      }).catch(console.error);
    } catch (e) {
      console.error("Profile save/match error:", e);
    }
  }, [user, why, pillar, filters, stack]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="gallery-label animate-pulse">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div key={fadeKey} className="screen-fade">
        {screen === "landing" && (
          <LandingScreen onNext={handleLandingNext} />
        )}
        {screen === "why" && (
          <><BackButton onClick={() => goTo("landing")} />
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
          <StackScreen onNext={(s) => { setStack(s); user ? goTo("pulse") : goTo("auth"); }} /></>
        )}
        {screen === "auth" && (
          <><BackButton onClick={() => goTo("stack")} />
          <AuthGate onAuthenticated={() => goTo("pulse")} /></>
        )}
        {screen === "pulse" && (
          <PulseScreen onNext={() => { saveProfileAndMatch(); goTo("outcome"); }} />
        )}
        {screen === "outcome" && (
          <OutcomeScreen matchCount={matchCount} />
        )}
      </div>
    </div>
  );
};

export default Index;
