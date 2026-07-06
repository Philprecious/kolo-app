import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp, naira } from "@/lib/store";
import { Plus, LogIn, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/circles/")({
  head: () => ({
    meta: [{ title: "My Circles — KOLO" }],
  }),
  component: () => <AppShell><CirclesList /></AppShell>,
});

function CirclesList() {
  const { circles } = useApp();
  return (
    <div>
      <PageHeader title="My Circles" subtitle={`${circles.length} active`} />

      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <Link
          to="/circles/create"
          className="flex flex-col items-start gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-btn"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Create Circle</p>
            <p className="text-xs text-white/70">Start a new savings group</p>
          </div>
        </Link>
        <Link
          to="/circles/join"
          className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-soft text-gold-foreground">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Join Circle</p>
            <p className="text-xs text-muted-foreground">Enter a code or scan QR</p>
          </div>
        </Link>
      </div>

      <div className="space-y-3 px-5">
        {circles.map((c) => {
          const paid = c.members.filter((m) => m.status === "paid").length;
          const pct = (paid / c.members.length) * 100;
          return (
            <Link
              key={c.id}
              to="/circles/$id"
              params={{ id: c.id }}
              className="block rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-sm font-bold text-primary">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold">{c.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${c.role === "admin" ? "bg-gold-soft text-gold-foreground" : "bg-primary-soft text-primary"}`}>
                      {c.role}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.members.length} members · {c.frequency} · {naira(c.amount)}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Cycle {c.cycle} of {c.totalCycles}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Nested outlet wrapper (unused but keeps future nesting available)
export const _Outlet = Outlet;
