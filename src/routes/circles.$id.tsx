import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp, naira } from "@/lib/store";
import {
  ArrowLeft, Copy, QrCode, UserPlus, Settings, BarChart3, XCircle,
  BellRing, CheckCircle2, ShieldCheck, Lock, ChevronDown, ChevronUp, Terminal, AlertOctagon, Crown,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/circles/$id")({
  head: () => ({ meta: [{ title: "Circle — KOLO" }] }),
  component: () => <AppShell><CircleDetail /></AppShell>,
});

// ---------- Kobo-safe money helpers (avoid FP drift) ----------
const toKobo = (naira: number) => Math.round(naira * 100);
const fromKobo = (kobo: number) => kobo / 100;
const fmtKobo = (kobo: number) =>
  `₦${fromKobo(kobo).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

type Ledger = {
  expectedKobo: number;
  receivedKobo: number;
  state: "verified" | "underpaid" | "overpaid" | "pending";
  deltaKobo: number; // received - expected (negative = deficit, positive = surplus)
};

// Deterministic mock ledger per member (uses index so numbers are stable per render)
function buildLedger(amountNaira: number, idx: number, status: "paid" | "pending" | "overdue"): Ledger {
  const expectedKobo = toKobo(amountNaira);
  if (status !== "paid") {
    return { expectedKobo, receivedKobo: 0, state: "pending", deltaKobo: -expectedKobo };
  }
  // idx 0 -> overpaid +₦500, idx 2 -> underpaid -₦2,000, rest exact
  let receivedKobo = expectedKobo;
  if (idx === 0) receivedKobo = expectedKobo + toKobo(500);
  else if (idx === 2) receivedKobo = expectedKobo - toKobo(2000);
  const deltaKobo = receivedKobo - expectedKobo;
  const state: Ledger["state"] =
    deltaKobo === 0 ? "verified" : deltaKobo > 0 ? "overpaid" : "underpaid";
  return { expectedKobo, receivedKobo, state, deltaKobo };
}

function CircleDetail() {
  const { id } = useParams({ from: "/circles/$id" });
  const { circles, devMode } = useApp();
  const c = circles.find((x) => x.id === id);
  const [devOpen, setDevOpen] = useState(false);

  const ledgers = useMemo(() => {
    if (!c) return [];
    return c.members.map((m, i) => buildLedger(c.amount, i, m.status));
  }, [c]);

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

  const targetKobo = toKobo(c.amount) * c.members.length;
  const collectedKobo = ledgers.reduce((s, l) => s + l.receivedKobo, 0);
  const remainingKobo = Math.max(0, targetKobo - collectedKobo);
  const carryForwardKobo = ledgers.reduce((s, l) => s + (l.deltaKobo > 0 ? l.deltaKobo : 0), 0);
  const canDisburse = collectedKobo >= targetKobo;

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
              <span className="font-mono">{fmtKobo(collectedKobo)} / {fmtKobo(targetKobo)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* PROMINENT Next Recipient card */}
          <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-gold/40">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gold">
              <Crown className="h-3.5 w-3.5" /> Next Recipient — This Cycle
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold text-lg font-bold text-gold-foreground shadow-btn">
                {nextMember.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-white">{nextMember.name}</p>
                <p className="text-[11px] font-semibold text-white/70">
                  Collection Turn: Position {c.cycle} of {c.members.length}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-gold/15 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold/90">Lump-sum payout</p>
              <p className="mt-0.5 text-3xl font-bold text-gold font-mono">{naira(c.amount * c.members.length)}</p>
              <p className="mt-1 text-[10px] text-white/60">
                {c.members.length} members × {naira(c.amount)} — one recipient collects the entire pot.
              </p>
            </div>
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

      {/* Members roster with ledger states */}
      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Members ({c.members.length})</p>
          <p className="text-xs text-muted-foreground">Rotation: {c.rotation}</p>
        </div>
        <div className="space-y-2">
          {c.members.map((m, i) => {
            const l = ledgers[i];
            return (
              <div key={m.id} className="rounded-2xl bg-card p-3 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Position #{m.position} · <span className="font-mono">exp {fmtKobo(l.expectedKobo)}</span>
                    </p>
                  </div>
                  {l.state === "verified" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-bold uppercase text-success">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {l.state === "overpaid" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold uppercase text-primary font-mono">
                      +{fmtKobo(l.deltaKobo)} credit
                    </span>
                  )}
                  {l.state === "underpaid" && (
                    <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-bold uppercase text-warning">
                      Underpaid
                    </span>
                  )}
                  {l.state === "pending" && (
                    <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-bold uppercase text-warning">
                      {m.status}
                    </span>
                  )}
                </div>

                {l.state === "underpaid" && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-warning-soft/60 px-3 py-2">
                    <p className="text-[11px] font-semibold text-warning">
                      owes <span className="font-mono">{fmtKobo(-l.deltaKobo)}</span> · received {fmtKobo(l.receivedKobo)}
                    </p>
                    <button
                      onClick={() => toast.success(`Reminder sent to ${m.name}`)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-btn"
                    >
                      <BellRing className="h-3 w-3" /> Remind
                    </button>
                  </div>
                )}
                {l.state === "overpaid" && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Surplus logged as carry-forward for next cycle.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Disbursement (admin only) */}
      {c.role === "admin" && (
        <section className="mt-6 px-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Payout / Disburse</p>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cycle target</p>
                <p className="mt-0.5 text-lg font-bold font-mono">{fmtKobo(targetKobo)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Collected</p>
                <p className="mt-0.5 text-lg font-bold font-mono">{fmtKobo(collectedKobo)}</p>
              </div>
            </div>
            {carryForwardKobo > 0 && (
              <p className="mt-2 text-[11px] text-primary font-mono">
                + {fmtKobo(carryForwardKobo)} carry-forward credit tracked
              </p>
            )}

            {!canDisburse && (
              <div className="mt-4 rounded-xl border border-warning/30 bg-warning-soft/60 p-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-warning" />
                  <p className="text-xs font-bold uppercase tracking-wider text-warning">Payout Locked</p>
                </div>
                <p className="mt-1 text-xs text-foreground">
                  Group collection is currently short by{" "}
                  <span className="font-mono font-bold">{fmtKobo(remainingKobo)}</span>. Use the Member Roster
                  above to remind pending contributors.
                </p>
              </div>
            )}

            {/* Nomba verification log */}
            <div className="mt-4 rounded-xl bg-[#0F1226] p-3 text-[11px] text-white/80 font-mono leading-relaxed">
              <p className="text-white/50">$ Calling Nomba Account Verification API…</p>
              <p><span className="text-[#E8883A]">POST</span> /transfers/bank/lookup</p>
              <p className="text-white/50">{`{ "accountNumber": "${"0123456789"}", "bankCode": "058" }`}</p>
              <div className="mt-2 rounded-lg bg-white/5 px-2 py-1.5">
                <p>resolved_name: <span className="text-white">{nextMember.name.toUpperCase()}</span></p>
                <p>bank: <span className="text-white">GTBank</span></p>
              </div>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-1 text-success">
                <ShieldCheck className="h-3 w-3" /> ✓ VERIFIED — Recipient Identity Matches. Safe to Disburse.
              </p>
            </div>

            <button
              disabled={!canDisburse}
              onClick={() => toast.success(`Disbursed ${fmtKobo(targetKobo)} to ${nextMember.name}`)}
              className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-btn disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {canDisburse ? `Disburse Funds · ${fmtKobo(targetKobo)}` : "Disburse Funds (Locked)"}
            </button>
          </div>
        </section>
      )}

      {/* Nomba Developer Console (admin only) */}
      {c.role === "admin" && (
        <section className="mt-6 px-5">
          <button
            onClick={() => setDevOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-2xl bg-[#0F1226] px-4 py-3 text-white shadow-soft"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <Terminal className="h-4 w-4 text-[#E8883A]" />
              Nomba Developer Console & Webhook Audit
            </span>
            {devOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {devOpen && (
            <div className="mt-2 space-y-3 rounded-2xl bg-[#0F1226] p-4 text-white/85">
              {/* Auth caching */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-[11px]">
                <p className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Auth Caching</p>
                <p className="mt-1">env: <span className="text-white">sandbox.api.nomba.com/v1</span></p>
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-success/20 px-2 py-1 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Token Status: Valid (54m remaining before 55-minute cache refresh)
                </p>
              </div>

              {/* Webhook feed */}
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider font-bold text-white/50">Webhook Live Feed</p>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Duplicate Event Rejected
                      </span>
                      <AlertOctagon className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <p className="mt-1.5">requestId: <span className="text-white">req_01HXK9F7A2E4Q1Z8V3B0DUP</span></p>
                    <p className="text-white/70">event: VIRTUAL_ACCOUNT_CREDIT</p>
                    <p className="text-destructive">Blocked via database unique index constraint on requestId</p>
                  </div>

                  {[
                    { id: "req_01HXK9F8B3M7T4Y6C2N9K1PA", amt: 1000000 },
                    { id: "req_01HXK9F9C4N8U5Z7D3P0L2QB", amt: 500000 },
                    { id: "req_01HXK9FAD5P9V6A8E4Q1M3RC", amt: 250000 },
                  ].map((w) => (
                    <div key={w.id} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white/50">event: <span className="text-white">VIRTUAL_ACCOUNT_CREDIT</span></span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] text-success">
                          <ShieldCheck className="h-3 w-3" /> HMAC-SHA256 Verified
                        </span>
                      </div>
                      <p className="mt-1">requestId: <span className="text-white">{w.id}</span></p>
                      <p className="text-white/70">amount_kobo: <span className="text-white">{w.amt.toLocaleString()}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

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
