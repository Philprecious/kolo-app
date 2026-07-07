import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ArrowLeft, QrCode, Link as LinkIcon, KeyRound, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/circles/join")({
  head: () => ({ meta: [{ title: "Join Circle — KOLO" }] }),
  component: () => <AppShell><Join /></AppShell>,
});

function Join() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const { circles } = useApp();

  const handleJoin = () => {
    const raw = code.trim().toUpperCase();
    if (raw.length < 4) {
      setError("Enter a valid invite code.");
      return;
    }
    // Match against real circle IDs (first 6 chars uppercased) or full id
    const match = circles.find(
      (c) => c.id.slice(0, 6).toUpperCase() === raw || c.id.toUpperCase() === raw,
    );
    if (!match) {
      setError("Group not found. Please verify the invite code and try again.");
      toast.error("Group not found. Please verify the invite code and try again.");
      return;
    }
    setError(null);
    toast.success(`Request sent to ${match.name} admin`);
    setTimeout(() => nav({ to: "/circles" }), 700);
  };


  return (
    <div>
      <PageHeader
        title="Join a Circle"
        subtitle="Enter an invite code, paste a link, or scan a QR."
        back={
          <Link to="/circles" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />

      <div className="space-y-3 px-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" /> Invite Code
          </div>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); if (error) setError(null); }}
            placeholder="KOLO-XXXX"
            aria-invalid={!!error}
            className={`w-full rounded-xl border bg-background px-4 py-3.5 text-center text-lg font-bold tracking-widest outline-none ${error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`}
          />
          {error && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] font-semibold text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button
            onClick={handleJoin}
            className="mt-3 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-btn"
          >
            Join circle
          </button>

        </div>

        <button className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">Paste invite link</p>
            <p className="text-xs text-muted-foreground">kolo.ng/j/...</p>
          </div>
        </button>

        <button className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold-soft text-gold-foreground">
            <QrCode className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">Scan QR code</p>
            <p className="text-xs text-muted-foreground">Use your camera to scan</p>
          </div>
        </button>
      </div>
    </div>
  );
}
