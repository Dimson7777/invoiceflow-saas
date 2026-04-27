import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Crown, Loader2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CANCEL_REASONS = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "missing_features", label: "Missing features I need" },
  { value: "found_alternative", label: "Found an alternative" },
  { value: "not_using", label: "Not using it enough" },
  { value: "temporary", label: "Just need a break" },
  { value: "other", label: "Other" },
];

const LOST_FEATURES = [
  "Unlimited invoices",
  "Unlimited clients",
  "Advanced analytics",
  "Priority support",
  "Custom branding",
  "API access",
];

type Step = "confirm" | "feedback" | "processing" | "success" | "error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CancelSubscriptionModal({ open, onOpenChange }: Props) {
  const { setPlan } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("confirm");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setStep("confirm");
    setReason("");
    setDetails("");
    setErrorMsg("");
  };

  const handleClose = (val: boolean) => {
    if (step === "processing") return; // prevent closing while processing
    if (!val) reset();
    onOpenChange(val);
  };

  const handleProceedToFeedback = () => setStep("feedback");

  const handleCancel = async () => {
    setStep("processing");
    try {
      const feedback = reason
        ? `${CANCEL_REASONS.find((r) => r.value === reason)?.label || reason}${details ? `: ${details}` : ""}`
        : details || null;

      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { feedback },
      });

      if (error) throw error;
      if (!data?.success) throw new Error("Cancellation failed. Please try again.");

      setStep("success");
      // Immediately update plan to free
      setPlan("free");
      toast.success("Your subscription has been canceled and you are now on the Free plan.");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  const handleRetry = () => {
    setErrorMsg("");
    handleCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Step 1: Confirmation */}
        {step === "confirm" && (
          <>
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-center text-lg">
                Cancel your Pro subscription?
              </DialogTitle>
              <DialogDescription className="text-center">
                We're sorry to see you go. Here's what you'll lose access to:
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
              {LOST_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4 text-destructive/60 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-muted-foreground text-center">
              Your Pro access will be removed immediately and you'll be switched to the Free plan.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => handleClose(false)}
                className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-opacity touch-manipulation"
              >
                <Crown className="h-4 w-4 mr-2" />
                Keep My Subscription
              </Button>
              <Button
                variant="ghost"
                onClick={handleProceedToFeedback}
                className="w-full text-muted-foreground hover:text-destructive touch-manipulation"
              >
                I still want to cancel
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Feedback */}
        {step === "feedback" && (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-center text-lg">
                Help us improve
              </DialogTitle>
              <DialogDescription className="text-center">
                Before you go, we'd love to know why you're canceling. This is completely optional.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Reason for canceling</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a reason (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCEL_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Anything else you'd like to share?
                </label>
                <Textarea
                  placeholder="Tell us more (optional)..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="destructive"
                onClick={handleCancel}
                className="w-full touch-manipulation"
              >
                Cancel My Subscription
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep("confirm")}
                className="w-full touch-manipulation"
              >
                Go Back
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Canceling your subscription...</p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <>
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <DialogTitle className="text-center text-lg">
                Subscription canceled
              </DialogTitle>
              <DialogDescription className="text-center">
                Your subscription has been canceled and you are now on the Free plan. You won't be charged again.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => {
                  handleClose(false);
                  navigate("/dashboard/billing");
                }}
                className="w-full touch-manipulation"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Billing
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleClose(false);
                  navigate("/dashboard");
                }}
                className="w-full touch-manipulation"
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        )}

        {/* Step 5: Error */}
        {step === "error" && (
          <>
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-center text-lg">
                Something went wrong
              </DialogTitle>
              <DialogDescription className="text-center">
                {errorMsg}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={handleRetry}
                className="w-full touch-manipulation"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleClose(false)}
                className="w-full touch-manipulation"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
