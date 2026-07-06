import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./auth.signup";
import resetIllustration from "@/assets/auth-reset.png";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Enter New Password — KÒLÓ" },
      { name: "description", content: "Set a new password for your KÒLÓ account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [showA, setShowA] = useState(false);
  const [showB, setShowB] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/auth/login" });
  };

  return (
    <AuthShell>
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-neutral-900">
        Enter New Password
      </h1>
      <p className="mt-3 text-center text-[14px] text-neutral-500">
        Please enter new password
      </p>

      <div className="mt-4 flex justify-center">
        <img src={resetIllustration} alt="" className="h-[220px] w-auto object-contain" />
      </div>

      <form onSubmit={submit} className="mt-4 space-y-5">
        <Field label="Password">
          <div className="relative">
            <input
              type={showA ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••••••"
              className="auth-input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowA((v) => !v)}
              className="absolute inset-y-0 right-4 flex items-center text-primary"
              aria-label="toggle"
            >
              {showA ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password">
          <div className="relative">
            <input
              type={showB ? "text" : "password"}
              value={cpw}
              onChange={(e) => setCpw(e.target.value)}
              placeholder="••••••••••••"
              className="auth-input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowB((v) => !v)}
              className="absolute inset-y-0 right-4 flex items-center text-primary"
              aria-label="toggle"
            >
              {showB ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-primary py-4 text-base font-bold text-white transition active:scale-[0.98]"
        >
          Reset Password
        </button>
      </form>
    </AuthShell>
  );
}
