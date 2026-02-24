import { useState, useCallback, useEffect } from "react";
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
import VerificationScreen from "@/components/screens/VerificationScreen";

type Screen = "landing" | "auth" | "why" | "pillar" | "filter" | "stack" | "verify" | "pulse" | "outcome";

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed top-6 left-6 z-50 gallery-label flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
  >
    <span className="text-base leading-none">←</span> Back
  </button>
);

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>("landing");
  const [why, setWhy] = useState("");
  const [pillar, setPillar] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [stack, setStack] = useState<[string, string, string]>(["", "", ""]);
  const [fadeKey, setFadeKey] = useState(0);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const goTo = useCallback((s: Screen) => {
    setFadeKey((k) => k + 1);
    setScreen(s);
  }, []);

  // Returning user check
  useEffect(() => {
    if (loading || !user) return;
    setCheckingProfile(true);
    supabase
      .from("profiles")
      .select("why, pillar, filters, stack, table_id, verified")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.why) {
          setWhy(data.why);
          setPillar(data.pillar ?? "");
          setFilters(data.filters ?? []);
          setStack((data.stack as [string, string, string]) ?? ["", "", ""]);
          setVerified(!!data.verified);
          if (data.verified) {
            goTo("outcome");
          } else {
            goTo("verify");
          }
        }
        setCheckingProfile(false);
      });
  }, [user, loading, goTo]);

  const handleLandingNext = useCallback(() => {
    goTo("why");
  }, [goTo]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setScreen("landing");
    setFadeKey((k) => k + 1);
  }, [signOut]);

  const saveProfileAndMatch = useCallback(async () => {
    if (!user) return;
    try {
      const email = user.email ?? "";
      const handle = email.split("@")[0];

      await supabase.from("profiles").upsert(
        { user_id: user.id, email, handle, why, pillar, filters, stack: stack as string[] },
        { onConflict: "user_id" }
      );

      const { data } = await supabase.functions.invoke("compute-matches", { body: { handle } });
      if (data?.total !== undefined) setMatchCount(data.total);

      supabase.functions.invoke("send-welcome-email", {
        body: { email, name: user.user_metadata?.full_name || handle },
      }).catch(console.error);
    } catch (e) {
      console.error("Profile save/match error:", e);
    }
  }, [user, why, pillar, filters, stack]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="gallery-label animate-pulse">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div key={fadeKey} className="screen-fade">
        {screen === "landing" && <LandingScreen onNext={handleLandingNext} />}
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
          <StackScreen onNext={(s) => { setStack(s); user ? goTo("verify") : goTo("auth"); }} /></>
        )}
        {screen === "auth" && (
          <><BackButton onClick={() => goTo("stack")} />
          <AuthGate onAuthenticated={() => goTo("verify")} /></>
        )}
        {screen === "verify" && user && (
          <><BackButton onClick={() => goTo("auth")} />
          <VerificationScreen userId={user.id} onVerified={() => goTo("pulse")} /></>
        )}
        {screen === "pulse" && (
          <PulseScreen onNext={() => { saveProfileAndMatch(); goTo("outcome"); }} />
        )}
        {screen === "outcome" && (
          <OutcomeScreen matchCount={matchCount} verified={verified} onSignOut={handleSignOut} />
        )}
      </div>
    </div>
  );
};

export default Index;
