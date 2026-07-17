import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useApp, naira } from "@/lib/store";
import {
  Bell, ArrowUpRight, Copy, Share2, ChevronRight, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KOLO — Digital Savings Circles powered by Nomba" },
      { name: "description", content: "Save with friends, family and colleagues. Create rotating savings circles and get paid on schedule with Nomba Virtual Accounts." },
      { property: "og:title", content: "KOLO — Digital Savings Circles" },
      { property: "og:description", content: "Modern Ajo, Esusu and contribution circles for Nigerians. Powered by Nomba." },
    ],
  }),
  component: () => <AppShell><Home /></AppShell>,
});


function Home() {
  const { user, circles, activity, payments, unreadCount } = useApp();
  const nextPayment = payments.find((p) => p.status === "upcoming");
  const nextCircle = nextPayment ? circles.find((c) => c.id === nextPayment.circleId) : undefined;
  const paidCount = nextCircle ? nextCircle.members.filter((m) => m.status === "paid").length : 0;
  const totalMembers = nextCircle?.members.length || 1;
  const progress = (paidCount / totalMembers) * 100;

  const copyAcct = () => {
    navigator.clipboard.writeText(user.virtualAccount.number);
    toast.success("Account number copied");
  };

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <header className="flex items-center justify-between px-5 pt-8">
        <div>
          <p className="text-sm text-muted-foreground">Good morning,</p>
          <h1 className="text-2xl font-bold">{user.name.split(" ")[0]} 👋</h1>
        </div>
        <Link
          to="/activity"
          aria-label="View notifications"
          className="relative grid h-11 w-11 place-items-center rounded-full bg-secondary text-foreground"
        >
          <Bell className="h-5 w-5" />
          {activity.some((a) => a.type === "invitation" && a.invite?.status === "pending") && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Link>
      </header>

      {/* Hero contribution card */}
      <section className="px-5">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-hero">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-6 h-32 w-32 rounded-full bg-gold/20" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
              <Sparkles className="h-3.5 w-3.5" /> Your contribution is due
            </div>
            <p className="mt-4 text-4xl font-bold tracking-tight">{naira(nextPayment.amount)}</p>
            <p className="mt-1 text-sm text-white/80">
              {nextCircle.name} · Due {nextPayment.due}
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-white/80">
                <span>{paidCount} of {nextCircle.members.length} members contributed</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <Link
              to="/payments"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-primary shadow-btn transition active:scale-[0.98]"
            >
              Pay now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* My circles preview */}
      <section className="px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">My circles</h2>
          <Link to="/circles" className="text-sm font-semibold text-primary">See all</Link>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {circles.map((c) => (
            <Link
              key={c.id}
              to="/circles/$id"
              params={{ id: c.id }}
              className="min-w-[220px] rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-sm font-bold text-primary">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${c.role === "admin" ? "bg-gold-soft text-gold-foreground" : "bg-primary-soft text-primary"}`}>
                  {c.role}
                </span>
              </div>
              <p className="mt-3 truncate text-sm font-bold">{c.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {c.members.length} members · {c.frequency}
              </p>
              <p className="mt-3 text-lg font-bold text-primary">{naira(c.amount)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Virtual account */}
      <section className="px-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Nomba Virtual Account
              </p>
              <p className="mt-2 text-2xl font-bold tracking-wider">{user.virtualAccount.number}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{user.virtualAccount.name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={copyAcct} className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
                <Copy className="h-4 w-4" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Powered by Nomba Secure Payments
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className="px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Recent activity</h2>
          <Link to="/activity" className="text-sm font-semibold text-primary">See all</Link>
        </div>
        <div className="space-y-2">
          {activity.slice(0, 3).map((a) => (
            <Link
              key={a.id}
              to="/activity/$id"
              params={{ id: a.id }}
              className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-soft transition active:scale-[0.99]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-lg">
                {a.type === "contribution" ? "💰" : a.type === "joined" ? "🙌" : a.type === "payout" ? "🎉" : a.type === "reminder" ? "🔔" : a.type === "invitation" ? "✉️" : "⚠️"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">{a.meta}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
