import { useEffect, type ReactNode } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

const PUBLIC_PREFIXES = ["/auth", "/onboarding"];

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, supaUser } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;
    if (!supaUser && !isPublic) {
      navigate({ to: "/auth/login", replace: true });
    } else if (supaUser && pathname.startsWith("/auth")) {
      navigate({ to: "/", replace: true });
    }
  }, [loading, supaUser, pathname, isPublic, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-primary-pale">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }
  if (!supaUser && !isPublic) return <div className="min-h-dvh bg-primary-pale" />;
  return <>{children}</>;
}

