import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { ChevronRight, Shield, Bell, HelpCircle, LogOut, Settings, Copy, Terminal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/")({
  head: () => ({ meta: [{ title: "Profile — KOLO" }] }),
  component: () => <AppShell><Profile /></AppShell>,
});

function Profile() {
  const { user, circles } = useApp();
  const adminCount = circles.filter((c) => c.role === "admin").length;
  const memberCount = circles.filter((c) => c.role === "member").length;

  return (
    <div>
      <PageHeader title="Profile" />

      <section className="px-5">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.phone}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <div className="rounded-2xl bg-primary-pale p-4">
          <p className="text-3xl font-bold text-primary">{adminCount}</p>
          <p className="mt-1 text-xs font-semibold text-primary">Admin in circles</p>
        </div>
        <div className="rounded-2xl bg-gold-soft p-4">
          <p className="text-3xl font-bold text-gold-foreground">{memberCount}</p>
          <p className="mt-1 text-xs font-semibold text-gold-foreground">Member in circles</p>
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomba Virtual Account</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold tracking-wider">{user.virtualAccount.number}</p>
              <p className="text-xs text-muted-foreground">{user.virtualAccount.name}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(user.virtualAccount.number); toast.success("Copied"); }}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Powered by Nomba Secure Payments
          </div>
        </div>
      </section>

      <section className="mt-5 px-5">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Settings</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {[
            { icon: Settings, label: "Account settings" },
            { icon: Shield, label: "Security & PIN" },
            { icon: Bell, label: "Notifications" },
            { icon: HelpCircle, label: "Help & support" },
          ].map((it, i, arr) => (
            <button key={it.label} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-foreground">
                <it.icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-semibold">{it.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 px-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-bold text-destructive">
          <LogOut className="h-4 w-4" /> Log out
        </button>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">KOLO · Powered by Nomba Secure Payments</p>
      </section>
    </div>
  );
}
