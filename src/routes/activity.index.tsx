import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/activity/")({
  head: () => ({ meta: [{ title: "Activity — KOLO" }] }),
  component: () => <AppShell><Activity /></AppShell>,
});

const iconFor = {
  contribution: "💰",
  joined: "🙌",
  payout: "🎉",
  reminder: "🔔",
  overdue: "⚠️",
  created: "✨",
} as const;

function Activity() {
  const { activity } = useApp();
  return (
    <div>
      <PageHeader title="Activity" subtitle="Every action across your circles." />
      <div className="relative px-5">
        <div className="absolute left-[36px] top-0 bottom-4 w-px bg-border" />
        <div className="space-y-3">
          {activity.map((a) => (
            <div key={a.id} className="relative flex items-start gap-3">
              <div className="z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-card text-lg shadow-soft">
                {iconFor[a.type]}
              </div>
              <div className="flex-1 rounded-2xl bg-card p-3.5 shadow-soft">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.meta}</p>
                <p className="mt-1 text-[11px] font-semibold text-primary">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
