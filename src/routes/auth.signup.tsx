import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import googleIcon from "@/assets/social-google.svg";
import facebookIcon from "@/assets/social-facebook.svg";
import appleIcon from "@/assets/social-apple.svg";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create an Account — KÒLÓ" },
      { name: "description", content: "Create your KÒLÓ account to start saving with trusted circles." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try { localStorage.setItem("kolo_onboarded", "true"); } catch { /* ignore */ }
    navigate({ to: "/" });
  };

  return (
    <AuthShell>
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-neutral-900">
        Create an Account
      </h1>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Philip Precious"
            className="auth-input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="auth-input"
          />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="auth-input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-4 flex items-center text-primary"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </Field>

        <label className="flex items-center gap-3 pt-1 text-[15px] text-neutral-400">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-5 w-5 rounded bg-primary/15 accent-primary"
          />
          Remember me
        </label>

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-primary py-4 text-base font-bold text-white transition active:scale-[0.98]"
        >
          Get Started
        </button>
      </form>

      <SocialSection />
    </AuthShell>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[15px] font-bold text-neutral-900">{label}</div>
      {children}
    </div>
  );
}

export function SocialSection() {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <span className="h-px flex-1 bg-neutral-300" />
        or continue with
        <span className="h-px flex-1 bg-neutral-300" />
      </div>
      <div className="mt-6 flex items-center justify-center gap-8">
        <SocialBtn src={googleIcon} label="Google" />
        <SocialBtn src={facebookIcon} label="Facebook" />
        <SocialBtn src={appleIcon} label="Apple" />
      </div>
    </div>
  );
}

function SocialBtn({ src, label }: { src: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={`Continue with ${label}`}
      className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm transition active:scale-95"
    >
      <img src={src} alt="" className="h-8 w-8" />
    </button>
  );
}
