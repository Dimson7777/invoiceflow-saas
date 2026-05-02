import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardTopbar } from "@/components/DashboardTopbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout() {
  const location = useLocation();
  const titles: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/clients": "Clients",
    "/dashboard/invoices": "Invoices",
    "/dashboard/analytics": "Analytics",
    "/dashboard/billing": "Billing",
  };
  const title = titles[location.pathname] || "Dashboard";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Ambient background — fixed behind all dashboard content */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="dashboard-dot-grid" />
            <div className="dashboard-ambient-blob dashboard-ambient-blob-a" />
            <div className="dashboard-ambient-blob dashboard-ambient-blob-b" />
          </div>

          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <div className="ml-auto">
              <DashboardTopbar />
            </div>
          </header>
          <main className="relative z-10 flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
