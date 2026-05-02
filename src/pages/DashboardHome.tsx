import { useApp } from "@/contexts/AppContext";
import { DollarSign, Users, FileText, TrendingUp, CheckCircle2, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="skeleton h-3 w-16" />
      </CardHeader>
      <CardContent>
        <div className="skeleton h-6 w-24 mb-1" />
        <div className="skeleton h-2.5 w-20" />
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="space-y-1.5">
        <div className="skeleton h-3.5 w-20" />
        <div className="skeleton h-2.5 w-28" />
      </div>
      <div className="skeleton h-4 w-16" />
    </div>
  );
}

export default function DashboardHome() {
  const { clients, clientsLoading, invoices, invoicesLoading } = useApp();

  const loading = clientsLoading || invoicesLoading;
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter((i) => i.status === "pending").length;

  const stats = [
    { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, sub: "Paid invoices" },
    { title: "Clients", value: clients.length.toString(), icon: Users, sub: `${clients.length === 1 ? "1 client" : `${clients.length} total`}` },
    { title: "Invoices", value: invoices.length.toString(), icon: FileText, sub: pendingCount > 0 ? `${pendingCount} pending` : "All settled" },
    { title: "Outstanding", value: `$${(pendingAmount + overdueAmount).toLocaleString()}`, icon: TrendingUp, sub: overdueAmount > 0 ? `$${overdueAmount.toLocaleString()} overdue` : "Nothing overdue" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3"><div className="skeleton h-4 w-28" /></CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><div className="skeleton h-4 w-28" /></CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Empty state for brand new users
  if (clients.length === 0 && invoices.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center py-16 px-4 animate-fade-in overflow-hidden">
        {/* Subtle animated background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="h-[380px] w-[380px] rounded-full bg-primary/5 blur-3xl animate-glow-pulse" />
        </div>
        {/* Subtle dot grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.55,
          }}
        />

        {/* Main onboarding card */}
        <div className="relative w-full max-w-md">
          {/* Glow ring */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-xl animate-glow-pulse"
          />
          <Card className="relative border border-border/60 shadow-elevated rounded-2xl bg-card/90 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center pt-10 pb-8 px-8 text-center gap-5">
              {/* Icon */}
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                <FileText className="h-7 w-7 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Let&apos;s get your first invoice out 🚀
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Add a client, create an invoice, and start tracking payments in minutes.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 pt-1">
                <Link to="/dashboard/clients">
                  <Button
                    size="sm"
                    className="transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_14px_hsl(var(--primary)/0.35)]"
                  >
                    Add a client
                  </Button>
                </Link>
                <Link to="/dashboard/invoices">
                  <Button
                    variant="outline"
                    size="sm"
                    className="transition-all duration-200 hover:scale-[1.04] hover:border-primary/50 hover:text-primary animate-pulse-soft"
                  >
                    New invoice
                  </Button>
                </Link>
              </div>

              {/* Trust line */}
              <p className="text-[11px] text-muted-foreground/70 pt-1">
                Everything updates automatically as you create invoices.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Step indicators */}
        <div className="mt-8 w-full max-w-md grid grid-cols-3 gap-3">
          {[
            { num: 1, label: "Add client", icon: Users, done: false },
            { num: 2, label: "Create invoice", icon: FileText, done: false },
            { num: 3, label: "Get paid", icon: BarChart2, done: false },
          ].map((step) => (
            <div
              key={step.num}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-3.5 text-center transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 hover:bg-card cursor-default"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted border border-border text-xs font-bold text-muted-foreground">
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  step.num
                )}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground leading-tight">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title} className="dashboard-card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-card-foreground">{s.value}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="dashboard-card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent invoices</CardTitle>
              {invoices.length > 0 && (
                <Link to="/dashboard/invoices" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  View all →
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No invoices yet</p>
                <Link to="/dashboard/invoices" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Create your first invoice
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">{inv.clientName} · {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-card-foreground">${inv.amount.toLocaleString()}</p>
                      <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        inv.status === "paid" ? "bg-success/10 text-success" :
                        inv.status === "pending" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Clients</CardTitle>
              {clients.length > 0 && (
                <Link to="/dashboard/clients" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  View all →
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No clients yet</p>
                <Link to="/dashboard/clients" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Add your first client
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {clients.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.company || c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
