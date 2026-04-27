import { Link } from "react-router-dom";
import { ArrowRight, FileText, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="gradient-hero">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-xl animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-[1.2]">
              Invoicing that gets out of your way
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Track clients, send invoices, and see what's been paid. Built for freelancers who'd rather do the work than manage the paperwork.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Log in</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="grid gap-8 sm:grid-cols-3 max-w-3xl">
          <div>
            <FileText className="h-5 w-5 text-primary mb-2.5" />
            <h3 className="text-sm font-semibold text-card-foreground">Invoices</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Create invoices, track status, and download receipts. Due dates and totals calculated automatically.</p>
          </div>
          <div>
            <Users className="h-5 w-5 text-primary mb-2.5" />
            <h3 className="text-sm font-semibold text-card-foreground">Clients</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Keep client info in one place. Every invoice links back to the right client.</p>
          </div>
          <div>
            <BarChart3 className="h-5 w-5 text-primary mb-2.5" />
            <h3 className="text-sm font-semibold text-card-foreground">Reports</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">See how much you've earned, what's outstanding, and where things stand — at a glance.</p>
          </div>
        </div>
      </section>

      <footer className="border-t py-6">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} InvoiceFlow
        </div>
      </footer>
    </div>
  );
}
