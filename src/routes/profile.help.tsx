import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/help")({
  head: () => ({ meta: [{ title: "Help & support — KOLO" }] }),
  component: () => <AppShell><Help /></AppShell>,
});

const faqs = [
  { q: "How does KOLO Ajo work?", a: "Members contribute a set amount on a schedule. Each cycle, the pooled funds pay out to one member on rotation until every member has collected." },
  { q: "How are payouts sent?", a: "Payouts are disbursed to the recipient's verified Nomba virtual account once the cycle target is fully collected." },
  { q: "What happens if a member is late?", a: "The circle admin is notified and can send a reminder. Overdue contributions are tracked in the roster with the outstanding amount." },
  { q: "Is my money safe?", a: "All movements run through Nomba Secure Payments with signed webhooks and a duplicate-event guardrail on every deposit." },
];

function Help() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <PageHeader
        title="Help & support"
        subtitle="We are here to help you save with confidence."
        back={
          <Link to="/profile" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />

      <section className="px-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact us</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: MessageCircle, label: "Chat", onClick: () => toast("Live chat coming soon") },
            { icon: Mail, label: "Email", onClick: () => { window.location.href = "mailto:support@kolo.ng"; } },
            { icon: Phone, label: "Call", onClick: () => { window.location.href = "tel:+2348000005656"; } },
          ].map((c) => (
            <button
              key={c.label}
              onClick={c.onClick}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 shadow-soft"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                <c.icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequently asked</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={i < faqs.length - 1 ? "border-b border-border" : ""}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex-1 text-sm font-semibold">{f.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-xs leading-relaxed text-muted-foreground">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
