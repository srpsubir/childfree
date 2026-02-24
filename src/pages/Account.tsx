import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ExternalLink, ArrowLeft, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SafetyReportDialog from "@/components/SafetyReportDialog";
import MutualConnectDialog from "@/components/MutualConnectDialog";

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

interface Tablemate {
  user_id: string;
  handle: string;
}

// Per-event social data loaded after the invitations list
interface EventSocialData {
  tablemates: Tablemate[];
  reportedUserIds: string[];   // user_ids already reported by current user for this event
  sentConnectIds: string[];    // target_ids for connect_requests sent by current user
  receivedConnectIds: string[];// requester_ids for connect_requests received by current user
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

  // Social data keyed by event_id
  const [socialData, setSocialData] = useState<Record<string, EventSocialData>>({});
  const [socialLoading, setSocialLoading] = useState(false);

  // Dialog state
  const [reportDialogEventId, setReportDialogEventId] = useState<string | null>(null);
  const [connectDialogEventId, setConnectDialogEventId] = useState<string | null>(null);

  // Load invitations
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

  // Load social data for past events once invitations are ready
  useEffect(() => {
    if (!user || fetching) return;

    const pastEventIds = invitations
      .filter((i) => i.events?.status === "past")
      .map((i) => i.events.id);

    if (pastEventIds.length === 0) return;

    setSocialLoading(true);

    async function loadSocial() {
      // 1. Get current user's profile (table_id)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("table_id")
        .eq("user_id", user!.id)
        .maybeSingle();

      const tableId = profileData?.table_id ?? null;

      // 2. Get tablemates: profiles with same table_id, excluding self
      let tablemateList: Tablemate[] = [];
      if (tableId) {
        const { data: tmData } = await supabase
          .from("profiles")
          .select("user_id, handle")
          .eq("table_id", tableId)
          .neq("user_id", user!.id);
        tablemateList = (tmData ?? []) as Tablemate[];
      }

      // 3. Get safety reports submitted by user for past events
      const { data: reportsData } = await supabase.from("safety_reports")
        .select("reported_user_id, event_id")
        .eq("reporter_id", user!.id)
        .in("event_id", pastEventIds);

      // 4. Get connect_requests sent by user for past events
      const { data: sentData } = await supabase.from("connect_requests")
        .select("target_id, event_id")
        .eq("requester_id", user!.id)
        .in("event_id", pastEventIds);

      // 5. Get connect_requests received by user for past events
      const { data: receivedData } = await supabase.from("connect_requests")
        .select("requester_id, event_id")
        .eq("target_id", user!.id)
        .in("event_id", pastEventIds);

      // Build per-event social data
      const byEvent: Record<string, EventSocialData> = {};
      for (const eventId of pastEventIds) {
        byEvent[eventId] = {
          tablemates: tablemateList,
          reportedUserIds: ((reportsData ?? []) as any[])
            .filter((r: any) => r.event_id === eventId)
            .map((r: any) => r.reported_user_id),
          sentConnectIds: ((sentData ?? []) as any[])
            .filter((r: any) => r.event_id === eventId)
            .map((r: any) => r.target_id),
          receivedConnectIds: ((receivedData ?? []) as any[])
            .filter((r: any) => r.event_id === eventId)
            .map((r: any) => r.requester_id),
        };
      }

      setSocialData(byEvent);
      setSocialLoading(false);
    }

    loadSocial();
  }, [user, fetching, invitations]);

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

  // Optimistic update helpers for dialogs
  function handleReported(eventId: string, reportedUserId: string) {
    setSocialData((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] ?? { tablemates: [], sentConnectIds: [], receivedConnectIds: [], reportedUserIds: [] }),
        reportedUserIds: [...(prev[eventId]?.reportedUserIds ?? []), reportedUserId],
      },
    }));
  }

  function handleConnectRequested(eventId: string, targetId: string) {
    setSocialData((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] ?? { tablemates: [], reportedUserIds: [], receivedConnectIds: [], sentConnectIds: [] }),
        sentConnectIds: [...(prev[eventId]?.sentConnectIds ?? []), targetId],
      },
    }));
  }

  const activeReportEvent = reportDialogEventId
    ? past.find((i) => i.events.id === reportDialogEventId)
    : null;

  const activeConnectEvent = connectDialogEventId
    ? past.find((i) => i.events.id === connectDialogEventId)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="gallery-label flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button
            onClick={handleSignOut}
            className="gallery-label text-muted-foreground hover:text-foreground transition-colors"
          >
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
                    <span
                      className={`font-body text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border ${
                        inv.status === "confirmed"
                          ? "border-primary text-primary"
                          : inv.status === "declined"
                          ? "border-destructive text-destructive"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-body">
                        {display} · {time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <a
                        href={inv.events.maps_link ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {inv.events.venue}, {inv.events.address}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {inv.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleRespond(inv.id, "confirmed")}
                          className="flex-1 bg-primary text-primary-foreground px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleRespond(inv.id, "declined")}
                          className="flex-1 border border-border text-muted-foreground px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:text-foreground transition-all"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {inv.status === "confirmed" && (
                      <a
                        href={buildCalendarUrl(inv.events)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border border-primary text-primary px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all text-center"
                      >
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
              const social = socialData[inv.events.id];
              const mutuals = social
                ? social.tablemates.filter(
                    (t) =>
                      social.sentConnectIds.includes(t.user_id) &&
                      social.receivedConnectIds.includes(t.user_id)
                  )
                : [];

              return (
                <div key={inv.id} className="border border-border/50 bg-card/50 p-6 space-y-4">
                  {/* Event info */}
                  <div>
                    <h3 className="gallery-heading text-lg text-foreground">{inv.events.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">{display}</p>
                  </div>

                  {/* Mutual connections */}
                  {mutuals.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="gallery-label text-muted-foreground">Mutual Connections</p>
                      <div className="flex flex-wrap gap-2">
                        {mutuals.map((t) => (
                          <span
                            key={t.user_id}
                            className="font-body text-xs border border-primary/50 text-primary px-2 py-0.5"
                          >
                            @{t.handle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!socialLoading && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        onClick={() => setReportDialogEventId(inv.events.id)}
                        className="flex items-center gap-1.5 border border-border/50 text-muted-foreground px-3 py-2 font-body text-[10px] uppercase tracking-[0.2em] hover:border-destructive/60 hover:text-destructive transition-colors"
                      >
                        <Shield className="h-3 w-3" />
                        Report an Issue
                      </button>
                      <button
                        onClick={() => setConnectDialogEventId(inv.events.id)}
                        className="flex items-center gap-1.5 border border-border/50 text-muted-foreground px-3 py-2 font-body text-[10px] uppercase tracking-[0.2em] hover:border-primary/60 hover:text-primary transition-colors"
                      >
                        <Users className="h-3 w-3" />
                        Connect
                        {social && social.sentConnectIds.length > 0 && (
                          <span className="ml-0.5 text-primary">
                            · {social.sentConnectIds.length}
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {invitations.length === 0 && (
          <div className="text-center py-12 animate-fade-up">
            <p className="gallery-body text-muted-foreground">
              No invitations yet. Your table is being assembled.
            </p>
          </div>
        )}
      </div>

      {/* Safety Report Dialog */}
      {activeReportEvent && user && (
        <SafetyReportDialog
          open={!!reportDialogEventId}
          onOpenChange={(open) => { if (!open) setReportDialogEventId(null); }}
          eventId={activeReportEvent.events.id}
          reporterId={user.id}
          tablemates={socialData[activeReportEvent.events.id]?.tablemates ?? []}
          existingReports={socialData[activeReportEvent.events.id]?.reportedUserIds ?? []}
          onReported={(reportedUserId) => {
            handleReported(activeReportEvent.events.id, reportedUserId);
            setReportDialogEventId(null);
          }}
        />
      )}

      {/* Mutual Connect Dialog */}
      {activeConnectEvent && user && (
        <MutualConnectDialog
          open={!!connectDialogEventId}
          onOpenChange={(open) => { if (!open) setConnectDialogEventId(null); }}
          eventId={activeConnectEvent.events.id}
          userId={user.id}
          tablemates={socialData[activeConnectEvent.events.id]?.tablemates ?? []}
          sentRequests={socialData[activeConnectEvent.events.id]?.sentConnectIds ?? []}
          receivedRequests={socialData[activeConnectEvent.events.id]?.receivedConnectIds ?? []}
          onRequested={(targetId) => {
            handleConnectRequested(activeConnectEvent.events.id, targetId);
          }}
        />
      )}
    </div>
  );
};

export default Account;
