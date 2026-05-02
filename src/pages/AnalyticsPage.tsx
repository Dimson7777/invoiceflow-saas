import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileText, TrendingUp, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsPage() {
  const { clients, invoices, clientsLoading, invoicesLoading } = useApp();
  const loading = clientsLoading || invoicesLoading;

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingRevenue = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdueRevenue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const monthlyData: Record<string, number> = {};
  invoices.filter(i => i.status === "paid").forEach(inv => {
    const d = new Date(inv.date);
    const key = d.toLocaleString("en-US", { month: "short" });
    monthlyData[key] = (monthlyData[key] || 0) + inv.amount;
  });
  const barData = Object.entries(monthlyData).map(([name, revenue]) => ({ name, revenue }));

  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const pieData = [
    { name: "Paid", value: paidCount, color: "hsl(152, 69%, 40%)" },
    { name: "Pending", value: pendingCount, color: "hsl(38, 92%, 50%)" },
    { name: "Overdue", value: overdueCount, color: "hsl(0, 84%, 60%)" },
  ].filter(d => d.value > 0);

  const stats = [
    { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { title: "Pending", value: `$${pendingRevenue.toLocaleString()}`, icon: TrendingUp },
    { title: "Overdue", value: `$${overdueRevenue.toLocaleString()}`, icon: FileText },
    { title: "Clients", value: clients.length.toString(), icon: Users },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><div className="skeleton h-3 w-16" /></CardHeader>
              <CardContent><div className="skeleton h-6 w-24" /></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2"><CardContent className="pt-6"><div className="skeleton h-[300px] w-full" /></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="skeleton h-[250px] w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title} className="dashboard-card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-card-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 dashboard-card-hover">
          <CardHeader>
            <CardTitle className="text-sm">Revenue by month</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <div className="relative h-[300px] rounded-xl border border-dashed border-border/70 bg-muted/20 overflow-hidden">
                {/* Dashed grid lines */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  {[20, 40, 60, 80].map((pct) => (
                    <div
                      key={pct}
                      className="absolute w-full border-t border-dashed border-border/40"
                      style={{ top: `${pct}%` }}
                    />
                  ))}
                </div>
                {/* Ghost shimmer bars */}
                <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 pb-0 gap-2 h-[85%]">
                  {[55, 35, 70, 45, 80, 40].map((h, i) => (
                    <div
                      key={i}
                      className="ghost-bar flex-1"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Glow */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary/6 blur-2xl animate-glow-pulse" />
                </div>
                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 backdrop-blur-[2px]">
                  <BarChart2 className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">Your revenue will appear here</p>
                  <p className="text-xs text-muted-foreground/60">
                    <Link to="/dashboard/invoices" className="hover:text-primary transition-colors underline underline-offset-2">
                      Create invoices to unlock analytics
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card-hover">
          <CardHeader>
            <CardTitle className="text-sm">Invoice breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="relative flex flex-col items-center justify-center h-[250px] rounded-xl border border-dashed border-border/70 bg-muted/20 overflow-hidden gap-3">
                {/* Ghost donut ring */}
                <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                  <div className="ghost-bar rounded-full" style={{ width: 120, height: 120, borderRadius: "50%", background: "none", border: "18px solid hsl(var(--muted))", animation: "shimmer 2.2s ease-in-out infinite", backgroundImage: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.06) 50%, hsl(var(--muted)) 75%)", backgroundSize: "200% 100%" }} />
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/5 blur-2xl animate-glow-pulse" />
                </div>
                <PieChartIcon className="relative h-6 w-6 text-muted-foreground/40 mt-20" />
                <p className="relative text-xs font-medium text-muted-foreground text-center px-4">Breakdown appears after first invoice.</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-1">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
