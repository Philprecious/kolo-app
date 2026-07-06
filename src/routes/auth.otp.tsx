import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import otpIllustration from "@/assets/auth-otp.png";

export const Route = createFileRoute("/auth/otp")({
  head: () => ({
    meta: [
      { title: "Enter OTP Code — KÒLÓ" },
      { name: "description", content: "Enter the OTP sent to your email." },
    ],
  }),
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const nd = [...d];
      nd[i] = c;
      return nd;
    });
    if (c && i < 3) refs.current[i + 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/auth/reset-password" });
  };

  return (
    <AuthShell>
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-neutral-900">
        Enter OTP Code
      </h1>
      <p className="mx-auto mt-3 max-w-[320px] text-center text-[14px] leading-relaxed text-neutral-500">
        Enter the OTP code sent to philipexample@gmail.com
      </p>

      <form onSubmit={submit} className="mt-8">
        <div className="flex justify-center gap-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
              }}
              className="h-16 w-16 rounded-2xl border border-neutral-300 bg-transparent text-center text-2xl font-bold text-neutral-900 outline-none focus:border-primary"
            />
          ))}
        </div>

        <p className="mt-6 text-center text-[14px] text-neutral-400">
          Didn&apos;t receive the code?{" "}
          <button type="button" className="font-semibold text-primary">Resend code</button>
        </p>

        <div className="mt-6 flex justify-center">
          <img src={otpIllustration} alt="" className="h-[200px] w-auto object-contain" />
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded-full bg-primary py-4 text-base font-bold text-white transition active:scale-[0.98]"
        >
          Verify
        </button>
      </form>
    </AuthShell>
  );
}
