import { ThemeToggle } from "@/components/ThemeToggle";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardTopbar() {
  const { isPro } = useApp();

  return (
    <div className="flex items-center gap-3">
      {!isPro && (
        <Link to="/dashboard/billing">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-accent">
            <Crown className="h-3.5 w-3.5" /> Upgrade
          </Button>
        </Link>
      )}
      {isPro && (
        <Badge className="gradient-primary text-primary-foreground border-0 gap-1">
          <Crown className="h-3 w-3" /> Pro
        </Badge>
      )}
      <ThemeToggle />
    </div>
  );
}
