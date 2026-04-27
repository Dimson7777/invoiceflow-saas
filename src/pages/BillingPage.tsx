import { useState, useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Loader2, ExternalLink, XCircle } from "lucide-react";
import { toast } from "sonner";
import CancelSubscriptionModal from "@/components/CancelSubscriptionModal";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "",
    features: ["Up to 3 invoices", "Up to 5 clients", "Basic analytics"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$10",
    period: "/mo",
    features: ["Unlimited invoices", "Unlimited clients", "Advanced analytics", "Priority support"],
    highlight: true,
  },
];

export default function BillingPage() {
  const { plan, isPro, setPlan, checkSubscription, subscriptionLoading } = useApp();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful — verifying your plan...");
      setSearchParams({}, { replace: true });
      let attempts = 0;
      pollingRef.current = setInterval(async () => {
        attempts++;
        await checkSubscription();
        if (attempts >= 15 && pollingRef.current) clearInterval(pollingRef.current);
      }, 2000);
    } else if (searchParams.get("canceled") === "true") {
      toast.error("Payment canceled");
      setSearchParams({}, { replace: true });
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    if (isPro && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      toast.success("You're now on Pro!");
    }
  }, [isPro]);

  useEffect(() => {
    const onFocus = () => checkSubscription();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkSubscription]);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
      setUpgradeLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No portal URL returned");
    } catch (err: any) {
      toast.error(err.message || "Failed to open subscription management");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Current plan: <span className="font-medium text-foreground">{isPro ? "Pro" : "Free"}</span>
        </p>
        {subscriptionLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {isPro && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={portalLoading} className="gap-1.5 text-xs">
              {portalLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              Manage
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(true)} disabled={portalLoading} className="gap-1.5 text-xs text-muted-foreground hover:text-destructive">
              <XCircle className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={`relative transition-shadow ${p.highlight ? "border-primary" : ""} ${plan === p.id ? "ring-2 ring-primary" : ""}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {p.id === "pro" && <Crown className="h-4 w-4 text-primary" />}
                {p.name}
              </CardTitle>
              <div>
                <span className="text-2xl font-bold text-card-foreground">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan === p.id ? (
                <Button variant="outline" className="w-full" disabled size="sm">Current plan</Button>
              ) : p.id === "pro" ? (
                <Button className="w-full" size="sm" onClick={handleUpgrade} disabled={upgradeLoading}>
                  {upgradeLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Redirecting...</> : "Upgrade to Pro"}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <CancelSubscriptionModal open={cancelModalOpen} onOpenChange={setCancelModalOpen} />
    </div>
  );
}
