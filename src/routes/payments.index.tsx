import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp, naira } from "@/lib/store";
import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/payments/")({
  head: () => ({ meta: [{ title: "Payments — KOLO" }] }),
  component: () => <AppShell><Payments /></AppShell>,
});

type Tab = "upcoming" | "paid" | "missed";
const tabs: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "paid", label: "Paid" },
  { id: "missed", label: "Missed" },
];

function Payments() {
  const { payments, payContribution } = useApp();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [autoDebit, setAutoDebit] = useState<Record<string, boolean>>({});
  const filtered = payments.filter((p) => p.status === tab);

  const toggleAuto = (id: string) =>
    setAutoDebit((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success(next[id] ? "Auto-contribution enabled" : "Auto-contribution disabled");
      return next;
    });

  return (
    <div>
      <PageHeader title="Payments" subtitle="All contributions in one place." />

      <div className="px-5">
        <div className="flex gap-1 rounded-2xl bg-secondary p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${tab === t.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2 px-5">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          </div>
        )}
        {filtered.map((p) => {
          const Icon = p.status === "paid" ? CheckCircle2 : p.status === "missed" ? XCircle : Clock;
          const iconColor = p.status === "paid" ? "text-success bg-success-soft" : p.status === "missed" ? "text-destructive bg-destructive/10" : "text-primary bg-primary-soft";
          return (
            <div key={p.id} className="rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.circleName}</p>
                  <p className="text-xs text-muted-foreground">{p.status === "paid" ? "Paid" : "Due"} · {p.due}</p>
                </div>
                <p className="text-base font-bold">{naira(p.amount)}</p>
              </div>
              {p.status === "upcoming" && (
                <>
                  <button
                    onClick={() => { payContribution(p.id); toast.success("Your contribution has been received 🎉"); }}
                    className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-btn"
                  >
                    Pay now · {naira(p.amount)}
                  </button>
                  <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!autoDebit[p.id]}
                      onClick={() => toggleAuto(p.id)}
                      className="flex w-full items-center justify-between gap-3"
                    >
                      <span className="flex flex-col items-start">
                        <span className="text-sm font-bold text-foreground">Enable Auto-Contribution</span>
                        <span className="text-[11px] text-muted-foreground">Debit automatically on the due date</span>
                      </span>
                      <span
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${autoDebit[p.id] ? "bg-primary" : "bg-border"}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-card shadow-soft transition ${autoDebit[p.id] ? "translate-x-5" : "translate-x-0.5"}`}
                        />
                      </span>
                    </button>
                    {autoDebit[p.id] && (
                      <p className="mt-3 rounded-lg bg-primary-pale p-2.5 text-[11px] leading-snug text-primary">
                        By enabling auto-contribution, you authorize KOLO to securely debit your linked account on the due date via Nomba Mandates.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 px-5">
        <div className="rounded-2xl border border-border bg-primary-pale p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Payment reminders</p>
          <p className="mt-1 text-sm text-foreground">You'll get a nudge 24 hours before each contribution is due.</p>
        </div>
      </div>
    </div>
  );
}
