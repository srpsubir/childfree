import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Tablemate {
  user_id: string;
  handle: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  reporterId: string;
  tablemates: Tablemate[];
  existingReports: string[]; // reported user_ids already submitted by this reporter for this event
  onReported: (reportedUserId: string) => void;
}

const CATEGORIES = [
  { value: "harassment", label: "Harassment" },
  { value: "misrepresentation", label: "Misrepresentation" },
  { value: "boundary_violation", label: "Boundary Violation" },
  { value: "other", label: "Other" },
] as const;

const MAX_DESC = 500;

export default function SafetyReportDialog({
  open,
  onOpenChange,
  eventId,
  reporterId,
  tablemates,
  existingReports,
  onReported,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const eligible = tablemates.filter((t) => !existingReports.includes(t.user_id));

  function reset() {
    setStep(1);
    setSelectedUserId("");
    setCategory("");
    setDescription("");
  }

  function handleClose(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  async function handleSubmit() {
    if (!selectedUserId || !category) return;
    setSubmitting(true);
    const { error } = await (supabase.from as any)("safety_reports").insert({
      reporter_id: reporterId,
      reported_user_id: selectedUserId,
      event_id: eventId,
      category,
      description: description.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit report. Please try again.");
      return;
    }
    toast.success("Report submitted. Our team will review it.");
    onReported(selectedUserId);
    handleClose(false);
  }

  const selectedHandle = tablemates.find((t) => t.user_id === selectedUserId)?.handle ?? "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border border-border max-w-md w-full p-0 gap-0 rounded-none">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="gallery-heading text-lg text-foreground">
            Report an Issue
          </DialogTitle>
          <DialogDescription className="gallery-body text-muted-foreground text-sm mt-1">
            {step === 1 && "Select the person you'd like to report."}
            {step === 2 && "What type of issue occurred?"}
            {step === 3 && "Add any additional details (optional)."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 space-y-5">
          {/* Step indicator */}
          <div className="flex gap-1.5">
            {([1, 2, 3] as const).map((s) => (
              <div
                key={s}
                className={`h-0.5 flex-1 transition-colors ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Select person */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="gallery-label text-muted-foreground">Tablemate</p>
              {eligible.length === 0 ? (
                <p className="gallery-body text-sm text-muted-foreground">
                  You've already submitted a report for everyone at your table.
                </p>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="rounded-none border-border bg-background font-body text-sm">
                    <SelectValue placeholder="Select a person…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border bg-background">
                    {eligible.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id} className="font-body text-sm">
                        @{t.handle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="gallery-label text-muted-foreground">Category</p>
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`w-full text-left px-4 py-3 border font-body text-xs uppercase tracking-[0.2em] transition-colors ${
                      category === c.value
                        ? "border-primary text-primary bg-primary/5"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Description */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="gallery-label text-muted-foreground">Details</p>
                <span className="gallery-micro text-muted-foreground">
                  {description.length}/{MAX_DESC}
                </span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                placeholder="Describe what happened…"
                className="rounded-none border-border bg-background font-body text-sm resize-none min-h-[120px]"
              />
              <p className="gallery-micro text-muted-foreground">
                Reporting: <span className="text-foreground">@{selectedHandle}</span> ·{" "}
                {CATEGORIES.find((c) => c.value === category)?.label}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="flex-1 border border-border text-muted-foreground px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:text-foreground transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              disabled={
                (step === 1 && !selectedUserId) ||
                (step === 2 && !category) ||
                eligible.length === 0
              }
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="flex-1 bg-primary text-primary-foreground px-4 py-3 font-body text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
