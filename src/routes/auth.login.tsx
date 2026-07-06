import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Field, SocialSection } from "./auth.signup";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Login — KÒLÓ" },
      { name: "description", content: "Sign in to your KÒLÓ account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
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
    <AuthShell
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/auth/signup" className="font-semibold text-primary">
            Sign Up
          </Link>
        </>
      }
    >
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-neutral-900">
        Login in to your account
      </h1>

      <form onSubmit={submit} className="mt-10 space-y-5">
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-3 text-[15px] text-neutral-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 rounded bg-primary/15 accent-primary"
            />
            Remember me
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-[15px] font-semibold text-neutral-900"
          >
            Forgot Password ?
          </Link>
        </div>

        <button
          type="submit"
          className="mt-10 w-full rounded-full bg-primary py-4 text-base font-bold text-white transition active:scale-[0.98]"
        >
          Sign In
        </button>
      </form>

      <SocialSection />
    </AuthShell>
  );
}
