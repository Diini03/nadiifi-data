import { Link } from "react-router-dom";
import {
  ArrowRight,
  Upload,
  ScanSearch,
  Sparkles,
  BarChart3,
  Download,
  ShieldCheck,
  Zap,
  FileJson,
  Languages,
  Github,
} from "lucide-react";
import { TopNav } from "@/components/landing/TopNav";
import { DataDemo } from "@/components/landing/DataDemo";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    body: "Drop a CSV, Excel or JSON file. Everything is parsed in your browser — nothing is uploaded unless you save it.",
  },
  {
    icon: ScanSearch,
    title: "Profile",
    body: "Column types, missing values, duplicates, outliers and mixed formats are detected automatically.",
  },
  {
    icon: Sparkles,
    title: "Clean",
    body: "Review every suggested fix, apply the ones you trust, and compare before/after with a full undo history.",
  },
  {
    icon: BarChart3,
    title: "Analyze",
    body: "KPI cards, distributions and relationship charts are generated from the shape of your data.",
  },
  {
    icon: Download,
    title: "Export",
    body: "Download analysis-ready CSV, Excel or JSON — or keep it in your cloud workspace across devices.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant, in-browser processing",
    body: "Parsing, profiling and cleaning run locally with SheetJS and Papaparse. No queues, no waiting on a server.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Your file never leaves the device unless you explicitly save it to your account, protected with row-level security.",
  },
  {
    icon: FileJson,
    title: "CSV, Excel and JSON",
    body: "Read messy exports from any tool and write back the format your pipeline expects.",
  },
  {
    icon: Sparkles,
    title: "AI dataset summaries",
    body: "Plain-language explanations of what changed, what looks wrong, and what to check next.",
  },
  {
    icon: BarChart3,
    title: "Automatic visual analytics",
    body: "Charts are chosen for you based on column types, cardinality and distribution.",
  },
  {
    icon: Languages,
    title: "English and Somali",
    body: "The full workspace is bilingual, switchable at any time without losing your work.",
  },
];

const ECOSYSTEM = [
  {
    name: "LearnData",
    body: "Guided lessons that teach the data skills behind every cleaning decision.",
    href: "https://github.com/Diini03",
  },
  {
    name: "ChartWorld",
    body: "A visualization playground for turning clean tables into presentation-ready charts.",
    href: "https://github.com/Diini03",
  },
  {
    name: "XogArag",
    body: "Somali-language data storytelling and open dataset exploration.",
    href: "https://github.com/Diini03",
  },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <TopNav />

      <main>
        <section id="product" className="relative overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.4]" aria-hidden />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6 md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              Data cleaning workspace, right in the browser
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Upload messy data.
              <br />
              Download analysis-ready data.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              NadiifiData profiles your spreadsheet, finds the duplicates, gaps and
              inconsistencies hiding inside it, and hands back a clean dataset with charts
              and a summary you can act on.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-lg px-6 shadow-glow">
                <Link to="/app">
                  Open the workspace
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-lg px-6">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <p className="mt-4 text-[12.5px] text-muted-foreground">
              No account needed to try it — sign in only when you want to save your work.
            </p>
          </div>
        </section>

        <section className="border-b border-border/70 bg-card/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20">
            <DataDemo />
          </div>
        </section>

        <section id="how-it-works" className="border-b border-border/70">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Five steps from raw export to reliable dataset
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              The workspace follows one linear workflow, so you always know what happened to
              your data and why.
            </p>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li
                    key={s.title}
                    className="rounded-xl border border-border/70 bg-card p-5 shadow-soft"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-[15px] font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="features" className="border-b border-border/70 bg-card/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for people who actually work with messy files
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <article
                    key={f.title}
                    className="rounded-xl border border-border/70 bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="resources" className="border-b border-border/70">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Part of a wider data ecosystem
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              NadiifiData handles the cleaning. These companion projects cover learning,
              visualization and storytelling.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {ECOSYSTEM.map((e) => (
                <a
                  key={e.name}
                  href={e.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-border/70 bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
                >
                  <h3 className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
                    {e.name}
                    <ArrowRight
                      className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                    {e.body}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card/30">
          <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Bring your worst spreadsheet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Open the workspace, drop a file, and see the profile in seconds.
            </p>
            <Button asChild size="lg" className="mt-7 h-11 rounded-lg px-6 shadow-glow">
              <Link to="/app">
                Start cleaning
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Logo size={20} withWordmark wordmarkClassName="text-[14px]" />
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            Built for analysts who deserve clean data.
          </p>
          <a
            href="https://github.com/Diini03/nadiifi-data"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" aria-hidden />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
