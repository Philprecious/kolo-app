import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/notifications")({
  head: () => ({ meta: [{ title: "Notifications — KOLO" }] }),
  component: () => <AppShell><Notifications /></AppShell>,
});

const options = [
  { key: "push", icon: Smartphone, label: "Push notifications", hint: "Reminders, payouts and invitations." },
  { key: "email", icon: Mail, label: "Email updates", hint: "Weekly summaries and receipts." },
  { key: "sms", icon: MessageSquare, label: "SMS alerts", hint: "Critical payout and overdue alerts." },
  { key: "marketing", icon: Bell, label: "Product news", hint: "New features and community updates." },
];

function Notifications() {
  const [state, setState] = useState<Record<string, boolean>>({ push: true, email: true, sms: false, marketing: false });

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Choose how KOLO reaches you."
        back={
          <Link to="/profile" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />
      <section className="space-y-2 px-5">
        {options.map((o) => (
          <div key={o.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary">
              <o.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{o.label}</p>
              <p className="text-[11px] text-muted-foreground">{o.hint}</p>
            </div>
            <Switch
              checked={state[o.key]}
              onCheckedChange={(v) => {
                setState((s) => ({ ...s, [o.key]: v }));
                toast.success(`${o.label} ${v ? "on" : "off"}`);
              }}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
