import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { ArrowLeft, Check, X, Mail, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/activity/$id")({
  head: () => ({ meta: [{ title: "Activity detail — KOLO" }] }),
  component: () => <AppShell><ActivityDetail /></AppShell>,
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

const labelFor: Record<string, string> = {
  contribution: "Contribution received",
  joined: "New member joined",
  payout: "Payout completed",
  reminder: "Reminder",
  overdue: "Overdue contribution",
  created: "Circle created",
  invitation: "Circle invitation",
};

function ActivityDetail() {
  const { id } = useParams({ from: "/activity/$id" });
  const { activity, circles, respondInvitation } = useApp();
  const nav = useNavigate();
  const a = activity.find((x) => x.id === id);

  if (!a) {
    return (
      <div className="px-5 pt-16 text-center">
        <p className="text-lg font-bold">Activity not found</p>
        <Link to="/activity" className="mt-4 inline-block text-sm font-semibold text-primary">Back to notifications</Link>
      </div>
    );
  }

  const circle = a.circleId ? circles.find((c) => c.id === a.circleId) : undefined;

  return (
    <div>
      <PageHeader
        title={labelFor[a.type] ?? "Activity"}
        subtitle={a.time}
        back={
          <button onClick={() => nav({ to: "/activity" })} className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        }
      />

      <section className="px-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-2xl">
            {iconFor[a.type] ?? "•"}
          </div>
          <p className="mt-4 text-lg font-bold">{a.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{a.meta}</p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-primary">{a.time}</p>
        </div>
      </section>

      {a.type === "invitation" && a.invite && (
        <section className="mt-4 px-5">
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-pale to-card">
            <div className="flex items-start gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{a.invite.groupName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">From {a.invite.from}</p>
                <p className="mt-1 text-[11px] font-semibold text-primary">
                  Invite code: <span className="font-mono">{a.invite.inviteCode}</span>
                </p>
              </div>
            </div>
            {a.invite.status === "pending" ? (
              <div className="grid grid-cols-2 gap-2 border-t border-border/60 bg-card/70 p-3">
                <button
                  onClick={() => { respondInvitation(a.id, "declined"); toast("Invitation declined"); }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2.5 text-sm font-bold"
                >
                  <X className="h-4 w-4" /> Decline
                </button>
                <button
                  onClick={() => { respondInvitation(a.id, "accepted"); toast.success(`Joined ${a.invite!.groupName}`); }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-btn"
                >
                  <Check className="h-4 w-4" /> Accept
                </button>
              </div>
            ) : (
              <div className={`border-t border-border/60 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider ${a.invite.status === "accepted" ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}>
                {a.invite.status === "accepted" ? "Accepted" : "Declined"}
              </div>
            )}
          </div>
        </section>
      )}

      {circle && (
        <section className="mt-4 px-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Related circle</p>
          <Link
            to="/circles/$id"
            params={{ id: circle.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-sm font-bold text-primary">
              {circle.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{circle.name}</p>
              <p className="text-xs text-muted-foreground">
                {circle.members.length} members · {circle.frequency}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        </section>
      )}
    </div>
  );
}
