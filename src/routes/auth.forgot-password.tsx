import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./auth.signup";
import forgotIllustration from "@/assets/auth-forgot.png";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — KÒLÓ" },
      { name: "description", content: "Reset your KÒLÓ password." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/auth/otp" });
  };

  return (
    <AuthShell>
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-neutral-900">
        Forgot Password
      </h1>
      <p className="mx-auto mt-3 max-w-[300px] text-center text-[14px] leading-relaxed text-neutral-500">
        To reset your password, you need your email address that can be authenticated
      </p>

      <div className="mt-6 flex justify-center">
        <img src={forgotIllustration} alt="" className="h-[220px] w-auto object-contain" />
      </div>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="philipexxample@gmail.com"
            className="auth-input"
          />
        </Field>

        <button
          type="submit"
          className="w-full rounded-full bg-primary py-4 text-base font-bold text-white transition active:scale-[0.98]"
        >
          Send OTP
        </button>
      </form>
    </AuthShell>
  );
}
