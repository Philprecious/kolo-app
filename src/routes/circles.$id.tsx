import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp, naira } from "@/lib/store";
import { ArrowLeft, Copy, QrCode, UserPlus, Settings, BarChart3, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/circles/$id")({
  head: () => ({ meta: [{ title: "Circle — KOLO" }] }),
  component: () => <AppShell><CircleDetail /></AppShell>,
});

function CircleDetail() {
  const { id } = useParams({ from: "/circles/$id" });
  const { circles } = useApp();
  const c = circles.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="px-5 pt-16 text-center">
        <p className="text-lg font-bold">Circle not found</p>
        <Link to="/circles" className="mt-4 inline-block text-sm font-semibold text-primary">Back to circles</Link>
      </div>
    );
  }

  const paid = c.members.filter((m) => m.status === "paid").length;
  const pct = (paid / c.members.length) * 100;
  const nextMember = c.members[c.cycle - 1] ?? c.members[0];

  return (
    <div className="pb-6">
      <PageHeader
        title={c.name}
        subtitle={`${c.members.length} members · ${c.frequency}`}
        back={
          <Link to="/circles" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
        action={
          <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${c.role === "admin" ? "bg-gold-soft text-gold-foreground" : "bg-primary-soft text-primary"}`}>
            {c.role}
          </span>
        }
      />

      {/* Progress hero */}
      <section className="px-5">
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-hero">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Contribution amount</p>
          <p className="mt-2 text-4xl font-bold">{naira(c.amount)}</p>
          <p className="mt-1 text-sm text-white/80">every {c.frequency.toLowerCase()}</p>

          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs text-white/80">
              <span>Cycle {c.cycle} of {c.totalCycles}</span>
              <span>{paid}/{c.members.length} paid</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Gross Pool Target</p>
                <p className="mt-0.5 text-sm font-bold">{nextMember.name}</p>
              </div>
              <p className="text-lg font-bold text-gold">{naira(c.amount * c.members.length)}</p>
            </div>
            <p className="mt-2 text-[10px] leading-snug text-white/60">*Disbursed via automated bank transfer subject to network routing fees.</p>
          </div>
        </div>
      </section>

      {/* Admin tools */}
      {c.role === "admin" && (
        <section className="mt-6 px-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin tools</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: UserPlus, label: "Invite", onClick: () => toast.success("Invite link copied") },
              { icon: QrCode, label: "QR Code" },
              { icon: Settings, label: "Settings" },
              { icon: BarChart3, label: "Analytics" },
            ].map((t) => (
              <button key={t.label} onClick={t.onClick} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                  <t.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Invite link */}
      <section className="mt-6 px-5">
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary-pale p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Invite link</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="truncate flex-1 text-sm font-mono text-foreground">kolo.ng/j/{c.id.slice(0, 6).toUpperCase()}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(`https://kolo.ng/j/${c.id}`); toast.success("Link copied"); }}
              className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Members ({c.members.length})</p>
          <p className="text-xs text-muted-foreground">Rotation: {c.rotation}</p>
        </div>
        <div className="space-y-2">
          {c.members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">Position #{m.position}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  m.status === "paid"
                    ? "bg-success-soft text-success"
                    : m.status === "overdue"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning-soft text-warning"
                }`}
              >
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {c.role === "admin" && (
        <section className="mt-6 px-5">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-bold text-destructive">
            <XCircle className="h-4 w-4" /> Close circle
          </button>
        </section>
      )}
    </div>
  );
}
