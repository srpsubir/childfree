import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EventInvitation {
  id: string;
  status: string;
  invited_at: string;
  events: {
    id: string;
    title: string;
    date: string;
    venue: string;
    address: string;
    maps_link: string | null;
    status: string;
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    display: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }),
  };
}

function buildCalendarUrl(e: EventInvitation["events"]) {
  const start = new Date(e.date);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(`${e.venue}, ${e.address}`)}`;
}

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<EventInvitation[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/"); return; }

    supabase
      .from("invitations")
      .select("id, status, invited_at, events(id, title, date, venue, address, maps_link, status)")
      .eq("user_id", user.id)
      .order("invited_at", { ascending: false })
      .then(({ data }) => {
        setInvitations((data as unknown as EventInvitation[]) ?? []);
        setFetching(false);
      });
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="gallery-label animate-pulse">Loading…</span>
      </div>
    );
  }

  const upcoming = invitations.filter((i) => i.events?.status === "upcoming");
  const past = invitations.filter((i) => i.events?.status === "past");

  const handleRespond = async (invitationId: string, status: "confirmed" | "declined") => {
    await supabase
      .from("invitations")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("id", invitationId);
    setInvitations((prev) =>
      prev.map((i) => (i.id === invitationId ? { ...i, status } : i))
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="gallery-label flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button onClick={handleSignOut} className="gallery-label text-muted-foreground hover:text-foreground transition-colors">
            Sign out
          </button>
        </div>

        <div className="space-y-2 text-center animate-fade-up">
          <h1 className="gallery-heading text-3xl font-semibold text-foreground">My Tables</h1>
          <p className="gallery-body text-muted-foreground">Your invitations and upcoming events.</p>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="space-y-4 animate-fade-up-delay">
            <p className="gallery-label">Upcoming</p>
            {upcoming.map((inv) => {
              const { display, time } = formatDate(inv.events.date);
              return (
                <div key={inv.id} className="border border-border bg-card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="gallery-heading text-lg text-foreground">{inv.events.title}</h3>
                    <span className={`font-body text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border ${
                      inv.status === "confirmed" ? "border-primary text-primary" :
                      inv.status === "declined" ? "border-destructive text-destructive" :
                      "border-muted-foreground text-muted-foreground"
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-body">{display} · {time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <a href={inv.events.maps_link ?? "#"} target="_blank" rel="noopener noreferrer" className="font-body hover:text-foreground transition-colors inline-flex items-center gap-1">
                        {inv.events.venue}, {inv.events.address}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {inv.status === "pending" && (
                      <>
                        <button onClick={() => handleRespond(inv.id, "confirmed")} className="flex-1 bg-primary text-primary-foreground px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all">
                          Confirm
                        </button>
                        <button onClick={() => handleRespond(inv.id, "declined")} className="flex-1 border border-border text-muted-foreground px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:text-foreground transition-all">
                          Decline
                        </button>
                      </>
                    )}
                    {inv.status === "confirmed" && (
                      <a href={buildCalendarUrl(inv.events)} target="_blank" rel="noopener noreferrer" className="flex-1 border border-primary text-primary px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all text-center">
                        Add to Calendar
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div className="space-y-4 animate-fade-up-delay">
            <p className="gallery-label">Past</p>
            {past.map((inv) => {
              const { display } = formatDate(inv.events.date);
              return (
                <div key={inv.id} className="border border-border/50 bg-card/50 p-6 opacity-60">
                  <h3 className="gallery-heading text-lg text-foreground">{inv.events.title}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">{display}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {invitations.length === 0 && (
          <div className="text-center py-12 animate-fade-up">
            <p className="gallery-body text-muted-foreground">No invitations yet. Your table is being assembled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
