import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

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
        <SocialBtn label="Google"><GoogleIcon /></SocialBtn>
        <SocialBtn label="Facebook"><FacebookIcon /></SocialBtn>
        <SocialBtn label="Apple"><AppleIcon /></SocialBtn>
      </div>
    </div>
  );
}

function SocialBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={`Continue with ${label}`}
      className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm transition active:scale-95"
    >
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 34.9 26.8 36 24 36c-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3C41.9 35.3 44 30 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#1877F2" />
      <path fill="#fff" d="M27 46V28.4h5.9l.9-6.9H27v-4.4c0-2 .6-3.4 3.4-3.4H34V7.4c-.6-.1-2.6-.3-4.9-.3-4.9 0-8.2 3-8.2 8.4v4.9h-5.5v6.9h5.5V46H27z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#111" />
      <path fill="#fff" d="M31 25.4c0-3.7 3-5.5 3.2-5.6-1.7-2.6-4.5-2.9-5.5-3-2.3-.2-4.5 1.4-5.7 1.4-1.2 0-3-1.4-4.9-1.3-2.5 0-4.9 1.5-6.2 3.7-2.7 4.6-.7 11.5 1.9 15.3 1.3 1.9 2.8 4 4.8 3.9 1.9-.1 2.6-1.2 4.9-1.2s2.9 1.2 4.9 1.2c2 0 3.3-1.9 4.6-3.8 1.4-2.2 2-4.3 2.1-4.4-.1 0-4-1.5-4.1-6.2zm-3.8-11.4c1-1.3 1.7-3 1.5-4.8-1.5.1-3.3 1-4.4 2.3-1 1.1-1.8 2.9-1.6 4.6 1.7.1 3.4-.8 4.5-2.1z" />
    </svg>
  );
}

