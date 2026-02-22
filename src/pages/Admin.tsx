import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/");
      return;
    }

    // Check admin role via edge function or direct query
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

  const triggerAssignTables = async () => {
    setAssigning(true);
    setAssignResult("");
    try {
      const { data, error } = await supabase.functions.invoke("assign-tables");
      if (error) throw error;
      setAssignResult(`Done: ${data?.tables_created ?? 0} tables created, ${data?.profiles_assigned ?? 0} profiles assigned`);
      // Refresh profiles
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
      </div>
    </div>
  );
};

export default Admin;
