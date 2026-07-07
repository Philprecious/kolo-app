import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp, naira } from "@/lib/store";
import { Check, X, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/activity/")({
  head: () => ({ meta: [{ title: "Activity — KOLO" }] }),
  component: () => <AppShell><Activity /></AppShell>,
});

const iconFor: Record<string, string> = {
  contribution: "💰",
  joined: "🙌",
  payout: "🎉",
  reminder: "🔔",
  overdue: "⚠️",
  created: "✨",
  invitation: "✉️",
};

function Activity() {
  const { activity, respondInvitation, circles } = useApp();

  const invitations = activity.filter((a) => a.type === "invitation");
  const rest = activity.filter((a) => a.type !== "invitation");

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Invitations and activity across your circles." />

      {invitations.length > 0 && (
        <section className="px-5 pb-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Invitations</p>
          <div className="space-y-3">
            {invitations.map((a) => {
              const inv = a.invite!;
              const pending = inv.status === "pending";
              return (
                <div key={a.id} className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-pale to-card shadow-soft">
                  <div className="flex items-start gap-3 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-btn">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">You have been invited to join {inv.groupName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">From {inv.from} · {a.meta.split("·").slice(1).join("·").trim() || "Ajo circle"}</p>
                      <p className="mt-1 text-[11px] font-semibold text-primary">Invite code: <span className="font-mono">{inv.inviteCode}</span></p>
                    </div>
                  </div>
                  {pending ? (
                    <div className="grid grid-cols-2 gap-2 border-t border-border/60 bg-card/70 p-3">
                      <button
                        onClick={() => { respondInvitation(a.id, "declined"); toast("Invitation declined"); }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2.5 text-sm font-bold text-foreground"
                      >
                        <X className="h-4 w-4" /> Decline
                      </button>
                      <button
                        onClick={() => { respondInvitation(a.id, "accepted"); toast.success(`Joined ${inv.groupName}`); }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-btn"
                      >
                        <Check className="h-4 w-4" /> Accept
                      </button>
                    </div>
                  ) : (
                    <div className={`border-t border-border/60 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider ${inv.status === "accepted" ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}>
                      {inv.status === "accepted" ? "Accepted" : "Declined"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="relative px-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent activity</p>
        <div className="absolute left-[36px] top-8 bottom-4 w-px bg-border" />
        <div className="space-y-3">
          {rest.map((a) => (
            <div key={a.id} className="relative flex items-start gap-3">
              <div className="z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-card text-lg shadow-soft">
                {iconFor[a.type] ?? "•"}
              </div>
              <div className="flex-1 rounded-2xl bg-card p-3.5 shadow-soft">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.meta}</p>
                <p className="mt-1 text-[11px] font-semibold text-primary">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
        {circles.length === 0 && (
          <p className="mt-6 text-center text-xs text-muted-foreground">No circles yet — create one to get started ({naira(0)}).</p>
        )}
      </div>
    </div>
  );
}
