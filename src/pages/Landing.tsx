import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  LayoutDashboard,
  Settings2,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

function useCountUp(target: number, duration = 1400, active = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let startTime: number | null = null;
    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [active, duration, target]);

  return value;
}

function useInView(threshold = 0.14) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

const MOCK_INVOICES = [
  { client: "Acme Studio", amount: 3200, status: "Paid", date: "Apr 28" },
  { client: "Bright Labs", amount: 1840, status: "Paid", date: "Apr 22" },
  { client: "Nova Agency", amount: 2180, status: "Pending", date: "May 12" },
  { client: "Pixel Works", amount: 980, status: "Paid", date: "Apr 15" },
];

const TRUST_TOOLS = ["Stripe", "Tailwind CSS", "Supabase", "React", "TypeScript", "Vite"];

function StatusPill({ status }: { status: string }) {
  const tone = status === "Paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400";
  const anim = status === "Paid" ? "animate-paid-glow" : "animate-pulse-soft";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${anim} ${tone}`}>
      {status}
    </span>
  );
}

function FloatCard({
  icon,
  label,
  sub,
  className = "",
  delay = "0s",
  rotate = "0deg",
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  className?: string;
  delay?: string;
  rotate?: string;
}) {
  return (
    <div className={`absolute z-20 ${className}`} style={{ transform: `rotate(${rotate})` }}>
      <div
        className="hidden sm:flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/75 backdrop-blur-md px-3.5 py-2.5 shadow-elevated landing-mini-float landing-badge-in"
        style={{ animationDelay: delay }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/90">
          {icon}
        </div>
        <div>
          <p className="text-[12px] font-semibold text-foreground leading-tight">{label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function ProductPreviewCard() {
  const { ref, inView } = useInView(0.1);
  const paid = useCountUp(8232, 1500, inView);
  const outstanding = useCountUp(2178, 1300, inView);
  const invoiceCount = useCountUp(12, 900, inView);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setActiveRow(0), 1800);
    const interval = setInterval(() => {
      setActiveRow(r => ((r ?? -1) + 1) % MOCK_INVOICES.length);
      setFlashKey(k => k + 1);
    }, 2800);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`relative z-10 w-full max-w-[760px] mx-auto transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Digital dust particles */}
      <span className="landing-particle" style={{ top: '16%', left: '-2%', animationDelay: '0s' }} />
      <span className="landing-particle" style={{ top: '44%', left: '-5%', animationDelay: '2.3s' }} />
      <span className="landing-particle" style={{ top: '72%', left: '1%', animationDelay: '4.6s' }} />
      <span className="landing-particle" style={{ top: '24%', right: '-3%', animationDelay: '1.4s' }} />
      <span className="landing-particle" style={{ top: '56%', right: '-1%', animationDelay: '3.1s' }} />
      <span className="landing-particle" style={{ top: '82%', right: '2%', animationDelay: '5.9s' }} />

      <div className="landing-orbit-layer hidden md:block" aria-hidden>
        <svg className="landing-orbit-svg" viewBox="0 0 760 560" preserveAspectRatio="none">
          <defs>
            <linearGradient id="orbitLineGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(220 92% 72% / 0.05)" />
              <stop offset="50%" stopColor="hsl(252 92% 72% / 0.36)" />
              <stop offset="100%" stopColor="hsl(220 92% 72% / 0.06)" />
            </linearGradient>
          </defs>
          <path className="landing-orbit-path" d="M72 295 C 190 182, 380 162, 688 206" />
          <path className="landing-orbit-path landing-orbit-path-b" d="M52 388 C 226 238, 420 228, 710 296" />
          <path className="landing-orbit-path landing-orbit-path-c" d="M90 444 C 276 302, 462 300, 706 372" />
          <circle className="landing-orbit-mote landing-orbit-mote-a" cx="278" cy="200" r="3.6" />
          <circle className="landing-orbit-mote landing-orbit-mote-b" cx="412" cy="255" r="3.6" />
          <circle className="landing-orbit-mote landing-orbit-mote-c" cx="344" cy="322" r="3.6" />
        </svg>
      </div>

      <div className="pointer-events-none absolute -inset-x-16 -inset-y-8 landing-preview-glow blur-2xl opacity-80" />

      <FloatCard
        icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
        label="Invoice paid +$3,200"
        sub="Acme Studio &middot; just now"
        className="-top-8 left-3"
        delay="0s"
        rotate="-1.5deg"
      />
      <FloatCard
        icon={<UserPlus className="h-3.5 w-3.5 text-primary" />}
        label="Client added"
        sub="Nova Agency"
        className="top-7 -right-4"
        delay="1.4s"
        rotate="1.8deg"
      />
      <FloatCard
        icon={<Bell className="h-3.5 w-3.5 text-amber-400" />}
        label="Payment due in 3 days"
        sub="Nova Agency &middot; $2,180"
        className="-bottom-8 right-12"
        delay="2.2s"
        rotate="-0.7deg"
      />

      <div className="landing-preview-perspective relative">
        <div className="landing-preview-tilt landing-preview-float relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-elevated ring-1 ring-primary/20">
          <div className="border-b border-border/60 px-4 py-2.5 flex items-center justify-between bg-background/40">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">InvoiceFlow</p>
              <span className="landing-live-dot" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-500/75">Live</span>
            </div>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
          </div>

          <div className="grid md:grid-cols-[170px_1fr]">
            <aside className="border-r border-border/60 bg-background/35 p-3.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2.5">Workspace</p>
              <div className="space-y-1">
                {[
                  { label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" />, active: true },
                  { label: "Invoices", icon: <FileText className="h-3.5 w-3.5" /> },
                  { label: "Clients", icon: <Users className="h-3.5 w-3.5" /> },
                  { label: "Payments", icon: <WalletCards className="h-3.5 w-3.5" /> },
                  { label: "Reports", icon: <BarChart3 className="h-3.5 w-3.5" /> },
                  { label: "Settings", icon: <Settings2 className="h-3.5 w-3.5" /> },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                      item.active
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground border border-transparent"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>
            </aside>

            <div className="relative p-3.5">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="landing-data-sweep" style={{ top: '34%', animationDelay: '0s' }} />
                <div className="landing-data-sweep" style={{ top: '62%', animationDelay: '1.9s' }} />
                <div className="landing-data-sweep" style={{ top: '84%', animationDelay: '3.5s' }} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: "Paid this month", value: `$${paid.toLocaleString()}`, sub: "+12% vs last month", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> },
                  { label: "Outstanding", value: `$${outstanding.toLocaleString()}`, sub: "1 invoice pending", icon: <Clock className="h-3.5 w-3.5 text-amber-400" /> },
                  { label: "Invoices sent", value: `${invoiceCount}`, sub: "This month", icon: <FileText className="h-3.5 w-3.5 text-primary" /> },
                  { label: "Next due", value: "May 12", sub: "Nova Agency", icon: <TrendingUp className="h-3.5 w-3.5 text-primary" /> },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border/60 bg-background/40 px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      {stat.icon}
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                    <p className="mt-1 text-base font-bold text-foreground tabular-nums">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-border/60 overflow-hidden bg-background/35">
                <div className="grid grid-cols-[1.3fr_0.9fr_0.8fr_0.8fr] px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <span>Client</span>
                  <span>Status</span>
                  <span>Amount</span>
                  <span>Due date</span>
                </div>
                {MOCK_INVOICES.map((inv, index) => (
                  <div
                    key={activeRow === index ? `flash-${flashKey}-${index}` : inv.client}
                    className={`grid grid-cols-[1.3fr_0.9fr_0.8fr_0.8fr] items-center px-3 py-2.5 text-xs border-b border-border/40 last:border-0 transition-colors ${activeRow === index ? 'landing-row-active' : 'hover:bg-primary/6'}`}
                  >
                    <span className="font-medium text-foreground">{inv.client}</span>
                    <span><StatusPill status={inv.status} /></span>
                    <span className="text-foreground tabular-nums">${inv.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground">{inv.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
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

      <section className="relative overflow-hidden landing-hero-bg landing-space-base">
        <div className="landing-noise-layer pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.18]" />
        <div className="landing-stars landing-stars-a pointer-events-none absolute inset-0 opacity-[0.54]" />
        <div className="landing-stars landing-stars-b pointer-events-none absolute inset-0 opacity-[0.38]" />
        <div className="landing-stars landing-stars-c pointer-events-none absolute inset-0 opacity-[0.24]" />
        <div className="landing-stars-rotation pointer-events-none absolute inset-0 opacity-[0.28]" />

        <span className="landing-star-glow left-[4%] top-[11%]" />
        <span className="landing-star-glow left-[6%] top-[38%]" style={{ animationDelay: "1.6s" }} />
        <span className="landing-star-glow left-[12%] top-[23%]" style={{ animationDelay: "2.8s" }} />
        <span className="landing-star-glow landing-star-glow-b left-[8%] top-[62%]" />
        <span className="landing-star-glow landing-star-glow-b left-[24%] top-[29%]" />
        <span className="landing-star-glow landing-star-glow-c left-[19%] top-[54%]" />
        <span className="landing-star-glow landing-star-glow-c right-[19%] top-[18%]" />
        <span className="landing-star-glow right-[33%] top-[33%]" />
        <span className="landing-star-glow landing-star-glow-b right-[12%] top-[41%]" />
        <span className="landing-star-glow landing-star-glow-c right-[26%] top-[64%]" />

        <div className="container relative py-10 md:py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:items-center lg:gap-8">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                <Zap className="h-3 w-3" />
                Built for freelancers
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white/95 leading-[1.08] hero-headline-animate">
                Stop chasing invoices.
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">Start getting paid</span>
                <br />
                with clarity.
              </h1>

              <p className="mt-5 text-base text-white/60 leading-relaxed max-w-lg">
                InvoiceFlow helps freelancers create invoices, track unpaid work, and understand cash flow from one clean dashboard.
              </p>
              <p className="mt-2 text-[12px] text-white/36 leading-relaxed">
                Used by independent developers, designers, and freelancers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" className="gap-2 shadow-md transition-all duration-200 hover:scale-[1.03] btn-primary-glow">
                    Start free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="transition-all duration-200 hover:scale-[1.03] hover:border-primary/50">
                    View demo
                  </Button>
                </Link>
              </div>

              <p className="mt-5 text-[12px] text-white/42 italic">No spreadsheets. No chasing. Just clarity.</p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                {["Free to start", "No card required", "5-minute setup"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-[11px] text-white/38">
                    <span className="h-1 w-1 rounded-full bg-violet-400/60 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end py-1 sm:py-5">
              <ProductPreviewCard />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-background/65">
        <div className="container py-4.5 md:py-5">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-center text-muted-foreground/85 font-semibold">
            Trusted by freelancers using modern tools
          </p>
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5 md:gap-3.5">
            {TRUST_TOOLS.map((tool) => (
              <span key={tool} className="landing-tool-pill">
                <span className="landing-tool-dot" />
                <span className="landing-tool-name">{tool}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

      <section className="relative py-9 md:py-11">
        <div className="pointer-events-none absolute inset-x-0 top-3 bottom-3 bg-gradient-to-b from-primary/[0.06] via-card/45 to-primary/[0.04]" />
        <div className="container relative">
          <div className="rounded-2xl border border-border/60 bg-card/[0.46] p-4 shadow-elevated backdrop-blur-sm md:p-6 lg:p-7">
            <div className="grid gap-7 lg:grid-cols-[0.9fr_1.18fr] lg:gap-7 lg:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Everything you need</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground leading-[1.18]">
                  Run your invoice workflow from one clean place.
                </h2>
                <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
                  Clients, invoice status, totals, and payment tracking stay connected - so nothing gets lost in a spreadsheet.
                </p>
                <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary hover:opacity-90">
                  Explore all features <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="landing-feature-showcase mx-auto max-w-3xl w-full rounded-2xl border border-primary/28 bg-card/[0.55] p-3.5 shadow-elevated ring-1 ring-primary/16 md:p-5">
                <svg className="pointer-events-none absolute inset-0 hidden md:block" viewBox="0 0 760 500" aria-hidden>
                  <defs>
                    <linearGradient id="connectorGradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(220 95% 72% / 0.1)" />
                      <stop offset="50%" stopColor="hsl(250 92% 70% / 0.4)" />
                      <stop offset="100%" stopColor="hsl(220 95% 72% / 0.1)" />
                    </linearGradient>
                  </defs>
                  <path id="conn-tl" d="M380 255 C 298 220, 242 178, 190 126" className="landing-connector-path" />
                  <path id="conn-tr" d="M380 255 C 462 220, 518 178, 570 126" className="landing-connector-path" />
                  <path id="conn-bl" d="M380 255 C 300 292, 242 336, 190 390" className="landing-connector-path" />
                  <path id="conn-br" d="M380 255 C 462 292, 518 336, 570 390" className="landing-connector-path" />
                  <circle cx="276" cy="205" r="4" className="landing-connector-dot" />
                  <circle cx="484" cy="205" r="4" className="landing-connector-dot" style={{ animationDelay: "1s" }} />
                  <circle cx="280" cy="302" r="4" className="landing-connector-dot" style={{ animationDelay: "1.7s" }} />
                  <circle cx="480" cy="302" r="4" className="landing-connector-dot" style={{ animationDelay: "2.4s" }} />
                  <circle r="2.5" className="landing-travel-dot">
                    <animateMotion dur="3.6s" repeatCount="indefinite" begin="0s"><mpath href="#conn-tl" /></animateMotion>
                  </circle>
                  <circle r="2.5" className="landing-travel-dot">
                    <animateMotion dur="4.2s" repeatCount="indefinite" begin="1.3s"><mpath href="#conn-tr" /></animateMotion>
                  </circle>
                  <circle r="2.5" className="landing-travel-dot">
                    <animateMotion dur="4.8s" repeatCount="indefinite" begin="2.5s"><mpath href="#conn-bl" /></animateMotion>
                  </circle>
                  <circle r="2.5" className="landing-travel-dot">
                    <animateMotion dur="3.9s" repeatCount="indefinite" begin="0.8s"><mpath href="#conn-br" /></animateMotion>
                  </circle>
                </svg>

                <div className="relative grid gap-3 sm:grid-cols-2 md:min-h-[430px] md:grid-cols-1">
                  <div className="order-1 md:absolute md:left-1/2 md:top-1/2 md:w-[292px] md:-translate-x-1/2 md:-translate-y-1/2 md:z-20">
                    <div className="landing-invoice-focus-hover relative rounded-2xl border border-primary/50 bg-card overflow-hidden ring-1 ring-primary/35" style={{ transform: 'rotate(-1.5deg)', boxShadow: '0 0 42px -8px hsl(var(--primary) / 0.42), 0 8px 28px -8px hsl(0 0% 0% / 0.4)' }}>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/26 via-transparent to-violet-500/20" />
                      <div className="relative border-b border-border/60 px-4 py-3 flex items-center justify-between">
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Invoice</p>
                        <StatusPill status="Paid" />
                      </div>
                      <div className="relative px-4 py-4 text-sm">
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/12 px-2 py-0.5 text-[10px] font-medium text-emerald-300">Paid</span>
                          <span className="rounded-full border border-primary/30 bg-primary/12 px-2 py-0.5 text-[10px] font-medium text-primary">PDF ready</span>
                          <span className="rounded-full border border-violet-500/30 bg-violet-500/12 px-2 py-0.5 text-[10px] font-medium text-violet-300">Auto totals</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>To</span>
                          <span>Invoice #2042</span>
                        </div>
                        <p className="mt-1 font-medium text-foreground">Acme Studio</p>
                        <div className="mt-3 rounded-md border border-border/60 bg-background/55 px-3 py-2">
                          <p className="text-xs text-muted-foreground">Amount due</p>
                          <p className="text-xl font-bold text-foreground mt-0.5">$3,200.00</p>
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                          <span>Website redesign</span>
                          <span>$3,200.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {[
                    {
                      title: "Client records",
                      body: "Keep all your clients and project details in one place.",
                      icon: <Users className="h-3.5 w-3.5 text-emerald-400" />,
                      pos: "md:absolute md:left-8 md:top-10 md:w-[198px]",
                      fc: "landing-fc-tl",
                    },
                    {
                      title: "Payment status",
                      body: "See paid, pending, and overdue at a glance.",
                      icon: <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />,
                      pos: "md:absolute md:right-8 md:top-10 md:w-[198px]",
                      fc: "landing-fc-tr",
                    },
                    {
                      title: "Fast invoice creation",
                      body: "Create professional invoices in under a minute.",
                      icon: <FileText className="h-3.5 w-3.5 text-violet-400" />,
                      pos: "md:absolute md:left-8 md:bottom-10 md:w-[198px]",
                      fc: "landing-fc-bl",
                    },
                    {
                      title: "Cash flow overview",
                      body: "Know exactly what is coming in and outstanding.",
                      icon: <TrendingUp className="h-3.5 w-3.5 text-primary" />,
                      pos: "md:absolute md:right-8 md:bottom-10 md:w-[198px]",
                      fc: "landing-fc-br",
                    },
                  ].map((item) => (
                    <div key={item.title} className={`order-2 ${item.pos}`}>
                      <div className={`landing-card landing-feature-card ${item.fc} h-full rounded-xl border border-border/55 bg-card/82 backdrop-blur-sm p-3.5 shadow-card ring-1 ring-primary/10`}>
                        <div className="mb-2.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70">
                          {item.icon}
                        </div>
                        <h3 className="text-[13px] font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-7">
        <div className="container flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} InvoiceFlow &middot; Simple invoicing for independent work
          </p>
        </div>
      </footer>
    </div>
  );
}
