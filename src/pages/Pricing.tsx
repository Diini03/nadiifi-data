import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Navbar } from "@/components/nadiifi/Navbar";
import { SiteFooter } from "@/components/nadiifi/SiteFooter";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Guest",
    price: "Free",
    note: "No account needed",
    body: "Everything the cleaning engine does, right now, in this tab.",
    features: [
      "CSV, TSV, Excel, JSON and NDJSON",
      "Automatic profiling and health score",
      "Every issue detector and fix",
      "Charts and export to CSV, Excel, JSON",
      "Data never leaves your browser",
    ],
    cta: "Clean a file",
    to: "/",
    highlight: false,
  },
  {
    name: "Workspace",
    price: "Free",
    note: "While in beta",
    body: "Adds a saved library so datasets follow you across devices.",
    features: [
      "Everything in Guest",
      "Saved dataset library",
      "Automatic sync after each clean",
      "Reopen a dataset where you left it",
      "Email or Google sign-in",
    ],
    cta: "Create an account",
    to: "/auth",
    highlight: true,
  },
  {
    name: "Team",
    price: "Coming soon",
    note: "Planned",
    body: "Shared datasets and reusable cleaning recipes for a group.",
    features: [
      "Everything in Workspace",
      "Shared team library",
      "Saved cleaning recipes",
      "Role-based access",
      "Priority support",
    ],
    cta: "How it works",
    to: "/how-it-works",
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Pricing · Nadiifi";
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar onStart={() => navigate("/")} />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-8 pt-14">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
            Pricing
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em]">
            Free to clean. Free to keep.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            The cleaning engine runs in your browser, so there is nothing to meter. An account only
            adds a saved library.
          </p>
        </section>

        <section className="border-t border-border/70 bg-muted/30 py-12">
          <div className="mx-auto grid max-w-5xl gap-3 px-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={
                  p.highlight
                    ? "rounded-xl border border-primary/60 bg-card p-5 shadow-glow"
                    : "rounded-xl border border-border/70 bg-card p-5"
                }
              >
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-[15px] font-semibold">{p.name}</h2>
                  {p.highlight && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em]">{p.price}</p>
                <p className="text-[12px] text-muted-foreground">{p.note}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13px] text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="sm"
                  variant={p.highlight ? "default" : "outline"}
                  className="mt-5 h-9 w-full rounded-md text-[13px] font-semibold"
                >
                  <Link to={p.to}>
                    {p.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Questions</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  q: "Is my data uploaded anywhere?",
                  a: "No. Parsing, profiling and cleaning run in your browser. Files are only stored if you sign in and save one.",
                },
                {
                  q: "Is there a file size limit?",
                  a: "The limit is your browser's memory rather than a plan cap. Files in the tens of megabytes work comfortably.",
                },
                {
                  q: "Will pricing change later?",
                  a: "Guest cleaning stays free. Paid tiers, if they arrive, would cover team features rather than the core tool.",
                },
                {
                  q: "Can I delete my account data?",
                  a: "Yes. Saved datasets are tied to your account and can be removed from your library at any time.",
                },
              ].map((f) => (
                <div key={f.q} className="rounded-xl border border-border/70 bg-card p-4">
                  <dt className="font-display text-[14px] font-semibold">{f.q}</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
