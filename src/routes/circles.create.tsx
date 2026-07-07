import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useApp, naira, type Frequency } from "@/lib/store";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Share2, QrCode } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/circles/create")({
  head: () => ({ meta: [{ title: "Create Circle — KOLO" }] }),
  component: () => <AppShell><CreateWizard /></AppShell>,
});

type Rotation = "Random" | "Manual" | "Fixed Order";

function CreateWizard() {
  const nav = useNavigate();
  const { addCircle } = useApp();
  const [step, setStep] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(10000);
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [maxMembers, setMaxMembers] = useState(10);
  const [rotation, setRotation] = useState<Rotation>("Random");

  const steps = ["Name", "Amount", "Frequency", "Members", "Rotation", "Review"];
  const total = steps.length;
  const pct = ((step + 1) / total) * 100;

  const canNext =
    (step === 0 && name.trim().length > 1) ||
    (step === 1 && amount >= 500) ||
    step === 2 ||
    (step === 3 && maxMembers >= 2) ||
    step === 4 ||
    step === 5;

  const submit = () => {
    const id = addCircle({
      name, description, amount, frequency, maxMembers, rotation,
      role: "admin", totalCycles: maxMembers,
    });
    setCreatedId(id);
    toast.success("Circle created 🎉");
  };

  if (createdId) return <SuccessScreen id={createdId} name={name} onDone={() => nav({ to: "/circles" })} />;

  return (
    <div className="pb-6">
      <header className="px-5 pt-8">
        <button onClick={() => (step === 0 ? nav({ to: "/circles" }) : setStep(step - 1))} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Step {step + 1} of {total}</p>
          <p className="text-xs font-semibold text-muted-foreground">{steps[step]}</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="mt-8 px-5">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Name your circle</h2>
            <p className="text-sm text-muted-foreground">Give it something your members will recognise.</p>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Family Savings"
              className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-base font-semibold outline-none focus:border-primary"
            />
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              rows={3}
              className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contribution amount</h2>
            <p className="text-sm text-muted-foreground">How much will each member contribute per cycle?</p>
            <div className="rounded-3xl bg-primary-pale p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Per member, per cycle</p>
              <p className="mt-3 text-4xl font-bold text-primary">{naira(amount)}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5000, 10000, 20000, 50000].map((v) => (
                <button key={v} onClick={() => setAmount(v)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-bold ${amount === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                  ₦{v/1000}k
                </button>
              ))}
            </div>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-base font-semibold outline-none focus:border-primary" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">How often?</h2>
            <p className="text-sm text-muted-foreground">Pick when members should contribute.</p>
            <div className="space-y-2">
              {(["Weekly", "Monthly", "Custom"] as Frequency[]).map((f) => (
                <button key={f} onClick={() => setFrequency(f)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${frequency === f ? "border-primary bg-primary-pale" : "border-border bg-card"}`}>
                  <div>
                    <p className="text-sm font-bold">{f}</p>
                    <p className="text-xs text-muted-foreground">
                      {f === "Weekly" ? "Every 7 days" : f === "Monthly" ? "Every month" : "Set your own schedule"}
                    </p>
                  </div>
                  {frequency === f && <Check className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Maximum members</h2>
            <p className="text-sm text-muted-foreground">Each member gets one payout per cycle.</p>
            <div className="rounded-3xl bg-primary-pale p-6 text-center">
              <p className="text-6xl font-bold text-primary">{maxMembers}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">members</p>
            </div>
            <input type="range" min={2} max={30} value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="w-full accent-[oklch(0.42_0.22_285)]" />
            <div className="flex justify-between text-xs text-muted-foreground"><span>2</span><span>30</span></div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Rotation method</h2>
            <p className="text-sm text-muted-foreground">How should payout order be decided?</p>
            <div className="space-y-2">
              {(["Random", "Manual", "Fixed Order"] as Rotation[]).map((r) => (
                <button key={r} onClick={() => setRotation(r)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${rotation === r ? "border-primary bg-primary-pale" : "border-border bg-card"}`}>
                  <div>
                    <p className="text-sm font-bold">{r}</p>
                    <p className="text-xs text-muted-foreground">
                      {r === "Random" ? "System picks the order fairly" : r === "Manual" ? "You choose each cycle" : "Order set at creation"}
                    </p>
                  </div>
                  {rotation === r && <Check className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Review your circle</h2>
            <p className="text-sm text-muted-foreground">Confirm the details before you create.</p>
            <div className="mt-4 space-y-1 rounded-2xl border border-border bg-card p-5">
              {[
                ["Name", name],
                ["Amount", naira(amount)],
                ["Frequency", frequency],
                ["Members", `${maxMembers} max`],
                ["Rotation", rotation],
                ["Total pool", naira(amount * maxMembers)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-sm font-bold">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              A Nomba Virtual Account will be linked to this circle.
            </p>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-24 z-30 mx-auto max-w-[440px] px-5">
        <button
          disabled={!canNext}
          onClick={() => (step === total - 1 ? submit() : setStep(step + 1))}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-btn disabled:opacity-40"
        >
          {step === total - 1 ? "Create Circle" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SuccessScreen({ id, name, onDone }: { id: string; name: string; onDone: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-success-soft">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-success text-white">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
      </div>
      <h1 className="mt-6 text-2xl font-bold">Circle created 🎉</h1>
      <p className="mt-2 text-sm text-muted-foreground">Share the invite so members can join {name}.</p>

      <div className="mt-6 w-full rounded-2xl border border-dashed border-primary/30 bg-primary-pale p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Invite link</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="flex-1 truncate text-sm font-mono">kolo.ng/j/{id.slice(0, 6).toUpperCase()}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(`https://kolo.ng/j/${id}`); toast.success("Copied"); }}
            className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"
          ><Copy className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mt-3 grid w-full grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold">
          <QrCode className="h-4 w-4" /> QR Code
        </button>
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      <button onClick={onDone} className="mt-6 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-btn">
        Open circle
      </button>
      <Link to="/circles" className="mt-3 text-xs font-semibold text-muted-foreground">Back to circles</Link>
    </div>
  );
}
