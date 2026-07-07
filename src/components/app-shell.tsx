import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, CreditCard, Activity, Settings as SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";

const tabs: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/circles", label: "Circles", icon: Users },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/profile", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-primary-pale">
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-background shadow-soft">
        <main className="flex-1 pb-28">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[440px] items-center justify-between border-t border-border bg-card/95 px-2 pb-6 pt-2 backdrop-blur">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to as never}
                className="flex flex-1 flex-col items-center gap-1 py-2"
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className={`text-[11px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {t.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-8">
      <div className="min-w-0 flex-1">
        {back}
        <h1 className="truncate text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
