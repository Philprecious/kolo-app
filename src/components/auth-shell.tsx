import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Shared shell for auth screens: cream background across the full page,
 * with a single purple curve sweeping from bottom-left up to the top-right
 * corner, and a small white strip below the curve for the footer link.
 * Matches the reference onboarding/auth mockups.
 */
export function AuthShell({ children, footer }: Props) {
  const defaultFooter = (
    <>
      Already have an account?{" "}
      <Link to="/auth/login" className="font-semibold text-primary">
        Login
      </Link>
    </>
  );

  return (
    <div className="min-h-dvh bg-white">
      <div className="relative mx-auto flex min-h-dvh max-w-[440px] flex-col bg-[#F5F1EA]">
        {/* Main content sits on the cream background */}
        <div className="flex-1 px-7 pt-14 pb-8">{children}</div>

        {/* Purple curve: filled region rising from bottom-left to top-right */}
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 440 70"
            preserveAspectRatio="none"
            className="block h-[52px] w-full"
          >
            <path
              d="M0,70 L440,70 L440,0 C400,6 340,18 260,32 C180,46 100,58 0,60 Z"
              className="fill-primary"
            />
          </svg>
          <div className="bg-white pb-6 pt-3 text-center text-sm text-neutral-500">
            {footer ?? defaultFooter}
          </div>
        </div>
      </div>
    </div>
  );
}
