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
        <div className="flex-1 px-7 pt-14 pb-32">{children}</div>

        {/* Purple wavy curve */}
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 440 110"
            preserveAspectRatio="none"
            className="block h-[90px] w-full"
          >
            <path
              d="M0,110 L0,70 C90,70 150,60 220,45 C300,28 360,10 440,25 L440,110 Z"
              className="fill-primary"
            />
            <path
              d="M0,110 L0,92 C80,92 150,84 220,68 C300,50 360,32 440,45 L440,110 Z"
              fill="#F5F1EA"
            />
          </svg>
          <div className="bg-white py-4 text-center text-sm text-neutral-500">
            {footer ?? defaultFooter}
          </div>
        </div>
      </div>
    </div>
  );
}
