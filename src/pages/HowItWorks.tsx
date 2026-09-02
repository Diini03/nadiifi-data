import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Upload, ScanSearch, Sparkles, BarChart3, Download } from "lucide-react";
import { Navbar } from "@/components/nadiifi/Navbar";
import { SiteFooter } from "@/components/nadiifi/SiteFooter";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Upload,
    title: "1 · Drop your file",
    body:
      "CSV, TSV, Excel, JSON or NDJSON. The file is read by your browser — nothing is uploaded to a server, so even confidential exports are safe to work with.",
  },
  {
    icon: ScanSearch,
    title: "2 · Automatic profiling",
    body:
      "Every column is typed and measured: missing values, blanks, duplicates, whitespace, inconsistent casing, numbers stored as text, unparseable dates and statistical outliers.",
  },
  {
    icon: Sparkles,
    title: "3 · Review and clean",
    body:
      "Each finding becomes a fix you can accept or skip. Apply them in one pass, see a before/after summary, and undo any step you disagree with.",
  },
  {
    icon: BarChart3,
    title: "4 · Analyze and visualize",
    body:
      "Health score, column insights and auto-generated charts built from the cleaned data — distributions, category breakdowns and trends without configuring anything.",
  },
  {
    icon: Download,
    title: "5 · Export",
    body:
      "Download clean CSV, Excel or JSON with consistent column names and types, ready to drop into your BI tool, notebook or spreadsheet.",
  },
];

const FAQ = [
  {
    q: "Does my data leave my computer?",
    a: "No. Parsing, profiling and cleaning all run in your browser. Datasets are only stored in the cloud if you sign in and save them to your workspace.",
  },
  {
    q: "How big a file can I clean?",
    a: "Files up to a few hundred thousand rows work comfortably on a modern laptop. Very large files are limited by your browser's memory, not by us.",
  },
  {
    q: "How is the health score calculated?",
    a: "A weighted mix of missing values, duplicate rows, type consistency and outliers. It is recomputed after every fix so you can watch the file improve.",
  },
  {
    q: "Do I need an account?",
    a: "No. Everything works as a guest. An account only adds a saved library so your datasets follow you across devices.",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "How it works · Nadiifi";
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar onStart={() => navigate("/")} />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pb-8 pt-14">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
            How it works
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em]">
            From messy file to analysis-ready data
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Nadiifi walks a dataset through five stages. Every stage is visible, reversible and
            runs entirely inside your browser.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="h-9 rounded-md text-[13px] font-semibold shadow-glow">
              <Link to="/">Start cleaning <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-md text-[13px]">
              <Link to="/resources">Read the guides</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border/70 bg-muted/30 py-12">
          <div className="mx-auto max-w-3xl space-y-3 px-4">
            {STEPS.map((s) => (
              <article key={s.title} className="flex gap-4 rounded-xl border border-border/70 bg-card p-5">
                <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-display text-[15px] font-semibold">{s.title}</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Common questions</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {FAQ.map((f) => (
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
