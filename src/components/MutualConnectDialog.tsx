import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Tablemate {
  user_id: string;
  handle: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  userId: string;
  tablemates: Tablemate[];
  sentRequests: string[];     // target_ids the user has already sent requests to
  receivedRequests: string[]; // requester_ids who have sent requests to this user
  mutualEmails: Record<string, string>; // user_id -> email, only for mutual connections
  onRequested: (targetId: string) => void;
}

export default function MutualConnectDialog({
  open,
  onOpenChange,
  eventId,
  userId,
  tablemates,
  sentRequests,
  receivedRequests,
  mutualEmails,
  onRequested,
}: Props) {
  const [pending, setPending] = useState<string[]>([]);

  async function handleConnect(targetId: string) {
    setPending((p) => [...p, targetId]);
    const { error } = await (supabase.from as any)("connect_requests").insert({
      requester_id: userId,
      target_id: targetId,
      event_id: eventId,
    });
    setPending((p) => p.filter((id) => id !== targetId));
    if (error) {
      toast.error("Could not send request. Please try again.");
      return;
    }
    toast.success("Connection request sent.");
    onRequested(targetId);

    // Notify both users if this created a mutual match
    supabase.functions.invoke("notify-mutual-match", {
      body: { requester_id: userId, target_id: targetId, event_id: eventId },
    }).catch((err) => console.error("notify-mutual-match error:", err));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-border max-w-md w-full p-0 gap-0 rounded-none">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="gallery-heading text-lg text-foreground">
            Connect with Tablemates
          </DialogTitle>
          <DialogDescription className="gallery-body text-muted-foreground text-sm mt-1">
            Mutual connections reveal each other's handle and email address.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-1">
          {tablemates.length === 0 && (
            <p className="gallery-body text-sm text-muted-foreground py-4">
              No other confirmed guests found for this event.
            </p>
          )}
          {tablemates.map((t) => {
            const sent = sentRequests.includes(t.user_id);
            const received = receivedRequests.includes(t.user_id);
            const mutual = sent && received;
            const isLoading = pending.includes(t.user_id);

            return (
              <div
                key={t.user_id}
                className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
              >
                <div className="space-y-0.5">
                  {mutual ? (
                    <>
                      <p className="font-body text-sm text-foreground">@{t.handle}</p>
                      {mutualEmails[t.user_id] && (
                        <p className="font-body text-xs text-muted-foreground">
                          {mutualEmails[t.user_id]}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground">
                      {sent ? "Request pending" : "Tablemate"}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {mutual ? (
                    <Badge
                      variant="outline"
                      className="rounded-none border-primary text-primary font-body text-[10px] uppercase tracking-[0.15em] px-2 py-0.5"
                    >
                      Mutual ✓
                    </Badge>
                  ) : sent ? (
                    <span className="gallery-label text-muted-foreground">Requested</span>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={() => handleConnect(t.user_id)}
                      className="border border-border text-muted-foreground px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "…" : "Connect"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="gallery-micro text-muted-foreground">
            Handles and emails are only revealed when both sides connect. Requests cannot be withdrawn.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
