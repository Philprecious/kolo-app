import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Shared shell for auth screens: cream background, dark purple wavy curve
 * at the bottom, and a small white footer strip with a link.
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
        <div className="flex-1 px-7 pt-14 pb-10">{children}</div>

        {/* Purple wavy curve rising toward top-right, matching reference */}
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 440 90"
            preserveAspectRatio="none"
            className="block h-[70px] w-full"
          >
            {/* Dark purple ribbon: low on the left, sweeps up to the top-right */}
            <path
              d="M0,58 C90,66 180,64 260,50 C330,38 385,18 440,4 L440,34 C385,44 330,60 260,70 C180,82 90,80 0,74 Z"
              className="fill-primary"
            />
            {/* White area beneath the ribbon */}
            <path
              d="M0,74 C90,80 180,82 260,70 C330,60 385,44 440,34 L440,90 L0,90 Z"
              fill="white"
            />
          </svg>
          <div className="bg-white pb-6 pt-2 text-center text-sm text-neutral-500">
            {footer ?? defaultFooter}
          </div>
        </div>
      </div>
    </div>
  );
}
