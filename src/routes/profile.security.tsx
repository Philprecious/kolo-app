import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ArrowLeft, Shield, ShieldCheck, Fingerprint } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/security")({
  head: () => ({ meta: [{ title: "Security & PIN — KOLO" }] }),
  component: () => <AppShell><Security /></AppShell>,
});

function Security() {
  const nav = useNavigate();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [biometrics, setBiometrics] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return toast.error("PIN must be 4 digits");
    if (pin !== confirm) return toast.error("PIN entries do not match");
    toast.success("Transaction PIN updated");
    setPin(""); setConfirm("");
    setTimeout(() => nav({ to: "/profile" }), 400);
  };

  return (
    <div>
      <PageHeader
        title="Security & PIN"
        subtitle="Protect payouts, contributions and account access."
        back={
          <Link to="/profile" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />

      <form onSubmit={save} className="space-y-3 px-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transaction PIN</p>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" /> Used for payouts and contribution approvals.
          </div>
          <PinField label="New 4-digit PIN" value={pin} onChange={setPin} />
          <div className="h-3" />
          <PinField label="Confirm PIN" value={confirm} onChange={setConfirm} />
          <button className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-btn">
            Update PIN
          </button>
        </div>

        <p className="pt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Options</p>
        <ToggleRow icon={Fingerprint} label="Biometric unlock" hint="Use Face ID or fingerprint on this device." value={biometrics} onChange={(v) => { setBiometrics(v); toast.success(v ? "Biometrics enabled" : "Biometrics disabled"); }} />
        <ToggleRow icon={ShieldCheck} label="Two-factor auth" hint="Confirm sensitive actions with an SMS code." value={twoFA} onChange={(v) => { setTwoFA(v); toast.success(v ? "2FA enabled" : "2FA disabled"); }} />
      </form>
    </div>
  );
}

function PinField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-2xl font-bold tracking-[0.6em] outline-none focus:border-primary"
        placeholder="••••"
      />
    </label>
  );
}

function ToggleRow({ icon: Icon, label, hint, value, onChange }: { icon: React.ElementType; label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
