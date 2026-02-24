import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string | null;
  handle: string | null;
  why: string | null;
  pillar: string | null;
  filters: string[] | null;
  stack: string[] | null;
  table_id: string | null;
  created_at: string;
}

interface SafetyReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  event_id: string | null;
  category: "harassment" | "misrepresentation" | "boundary_violation" | "other";
  description: string;
  status: string;
  created_at: string;
  // resolved after batch lookups
  reporter_handle?: string | null;
  reported_handle?: string | null;
  event_title?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "text-muted-foreground",
  reviewed: "text-primary",
  dismissed: "text-destructive",
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState("");

  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/");
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!data) {
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, handle, why, pillar, filters, stack, table_id, created_at")
        .order("created_at", { ascending: false });
      setProfiles(data ?? []);
      setLoading(false);
    };

    fetchProfiles();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchReports();
  }, [isAdmin]);

  const fetchReports = async () => {
    setReportsLoading(true);

    const { data: rawReports, error } = await supabase
      .from("safety_reports")
      .select("id, reporter_id, reported_user_id, event_id, category, description, status, created_at")
      .order("created_at", { ascending: false });

    if (error || !rawReports) {
      setReportsLoading(false);
      return;
    }

    // Collect unique user ids for batch profile lookup
    const userIds = Array.from(
      new Set([
        ...rawReports.map((r) => r.reporter_id),
        ...rawReports.map((r) => r.reported_user_id),
      ].filter(Boolean))
    );

    // Collect unique event ids
    const eventIds = Array.from(
      new Set(rawReports.map((r) => r.event_id).filter(Boolean))
    ) as string[];

    const [profileRes, eventRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from("profiles").select("id, handle, email").in("id", userIds)
        : Promise.resolve({ data: [] }),
      eventIds.length > 0
        ? supabase.from("events").select("id, title").in("id", eventIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap: Record<string, string | null> = {};
    for (const p of profileRes.data ?? []) {
      profileMap[p.id] = p.handle || p.email || null;
    }

    const eventMap: Record<string, string | null> = {};
    for (const e of eventRes.data ?? []) {
      eventMap[e.id] = e.title ?? null;
    }

    const enriched: SafetyReport[] = rawReports.map((r) => ({
      ...r,
      reporter_handle: profileMap[r.reporter_id] ?? null,
      reported_handle: profileMap[r.reported_user_id] ?? null,
      event_title: r.event_id ? (eventMap[r.event_id] ?? null) : null,
    }));

    setReports(enriched);
    setReportsLoading(false);
  };

  const updateReportStatus = async (id: string, status: "reviewed" | "dismissed") => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("safety_reports")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update report status.");
    } else {
      toast.success(`Report marked as ${status}.`);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    }
    setUpdatingId(null);
  };

  const triggerAssignTables = async () => {
    setAssigning(true);
    setAssignResult("");
    try {
      const { data, error } = await supabase.functions.invoke("assign-tables");
      if (error) throw error;
      setAssignResult(`Done: ${data?.tables_created ?? 0} tables created, ${data?.profiles_assigned ?? 0} profiles assigned`);
      const { data: refreshed } = await supabase
        .from("profiles")
        .select("id, email, handle, why, pillar, filters, stack, table_id, created_at")
        .order("created_at", { ascending: false });
      setProfiles(refreshed ?? []);
    } catch (e: any) {
      setAssignResult(`Error: ${e.message}`);
    }
    setAssigning(false);
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="gallery-label animate-pulse">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="gallery-heading text-3xl font-semibold">Admin</h1>
            <p className="gallery-label mt-2">{profiles.length} signups</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={triggerAssignTables}
              disabled={assigning}
              className="bg-primary text-primary-foreground px-5 py-3 font-body text-xs uppercase tracking-[0.2em] transition-all hover:opacity-90 disabled:opacity-50"
            >
              {assigning ? "Assigning…" : "Assign Tables"}
            </button>
          </div>
        </div>

        {assignResult && (
          <p className="font-body text-sm text-muted-foreground border border-border p-3">
            {assignResult}
          </p>
        )}

        {/* Profiles Table */}
        {loading ? (
          <p className="gallery-label animate-pulse">Loading profiles…</p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {["Email", "Why", "Pillar", "Filters", "Stack", "Table", "Joined"].map((h) => (
                    <th key={h} className="gallery-label px-4 py-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3 font-body text-sm">{p.email || p.handle || "—"}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">{p.why || "—"}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">{p.pillar || "—"}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                      {p.filters?.join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                      {p.stack?.join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                      {p.table_id ? p.table_id.slice(0, 8) : "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Safety Reports Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="gallery-heading text-xl font-semibold">Safety Reports</h2>
            {pendingCount > 0 && (
              <span className="bg-primary text-primary-foreground font-body text-xs px-2 py-0.5 uppercase tracking-[0.15em]">
                {pendingCount} pending
              </span>
            )}
          </div>

          {reportsLoading ? (
            <p className="gallery-label animate-pulse">Loading reports…</p>
          ) : reports.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground border border-border p-4">
              No safety reports yet.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["Reporter", "Reported", "Event", "Category", "Description", "Status", "Date", "Action"].map((h) => (
                      <th key={h} className="gallery-label px-4 py-3 font-normal whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                      <td className="px-4 py-3 font-body text-sm">
                        {r.reporter_handle ?? r.reporter_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-body text-sm">
                        {r.reported_handle ?? r.reported_user_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                        {r.event_title ?? (r.event_id ? r.event_id.slice(0, 8) : "—")}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground capitalize">
                        {r.category.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground max-w-[200px]">
                        <span
                          className="block overflow-hidden text-ellipsis whitespace-nowrap"
                          title={r.description}
                        >
                          {r.description}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-body text-sm capitalize ${STATUS_STYLES[r.status] ?? "text-muted-foreground"}`}>
                        {r.status}
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateReportStatus(r.id, "reviewed")}
                              disabled={updatingId === r.id}
                              className="font-body text-xs uppercase tracking-[0.15em] px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              Reviewed
                            </button>
                            <button
                              onClick={() => updateReportStatus(r.id, "dismissed")}
                              disabled={updatingId === r.id}
                              className="font-body text-xs uppercase tracking-[0.15em] px-3 py-1.5 bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span className="font-body text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
