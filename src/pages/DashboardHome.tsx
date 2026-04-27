import { useApp } from "@/contexts/AppContext";
import { DollarSign, Users, FileText, TrendingUp, Loader2 } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <FileText className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Welcome to InvoiceFlow</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
          Start by adding a client, then create your first invoice.
        </p>
        <div className="flex gap-3">
          <Link to="/dashboard/clients">
            <Button variant="outline" size="sm">Add a client</Button>
          </Link>
          <Link to="/dashboard/invoices">
            <Button size="sm">New invoice</Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-8 max-w-xs text-center">
          Tip: After creating an invoice, you can change its status to Paid directly from the list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
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
        <Card>
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

        <Card>
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
