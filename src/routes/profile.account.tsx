import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/account")({
  head: () => ({ meta: [{ title: "Account settings — KOLO" }] }),
  component: () => <AppShell><AccountSettings /></AppShell>,
});

function AccountSettings() {
  const { user } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Account details saved");
    setTimeout(() => nav({ to: "/profile" }), 400);
  };

  return (
    <div>
      <PageHeader
        title="Account settings"
        subtitle="Update your personal information."
        back={
          <Link to="/profile" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />
      <form onSubmit={save} className="space-y-4 px-5">
        <Field label="Full name" value={name} onChange={setName} />
        <Field label="Email address" value={email} onChange={setEmail} type="email" />
        <Field label="Phone number" value={phone} onChange={setPhone} />
        <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-btn">
          <Save className="h-4 w-4" /> Save changes
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
      />
    </label>
  );
}
