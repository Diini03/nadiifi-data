import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/nadiifi/Navbar";
import { Button } from "@/components/ui/button";

const GUIDES = [
  {
    tag: "Guide",
    title: "Prepare your file",
    body:
      "One header row, one record per row, no merged cells and no summary totals inside the data. Nadiifi reads CSV, TSV, Excel, JSON and NDJSON. If a spreadsheet has several tabs, export the one you want to clean first.",
  },
  {
    tag: "Workflow",
    title: "Data → Clean → Visualize",
    body:
      "Profile the file, review the flagged issues, apply the fixes you agree with, then chart the result. Each stage is a step in the workflow bar, so you can move back and forth without losing your place.",
  },
  {
    tag: "Reference",
    title: "How the health score works",
    body:
      "A weighted mix of missing values, duplicate rows, type consistency and outliers. It is recomputed after every fix, which makes it a quick way to judge whether a cleaning pass actually helped.",
  },
  {
    tag: "Privacy",
    title: "Where your data lives",
    body:
      "Parsing and cleaning happen in your browser. Nothing is uploaded unless you sign in and choose to save a dataset to your workspace, and saved datasets are visible only to your account.",
  },
  {
    tag: "Export",
    title: "Getting data out",
    body:
      "Download clean CSV, Excel or JSON. Column names and inferred types stay consistent with what you saw on screen, so downstream scripts and dashboards keep working.",
  },
  {
    tag: "Tips",
    title: "Start with the sample",
    body:
      "The retail sales sample includes duplicates, blanks, inconsistent categories and outliers, so you can see every detector fire and every chart render before touching your own data.",
  },
];

const GLOSSARY = [
  ["Duplicate row", "A record that repeats an existing row across all columns."],
  ["Missing value", "An empty cell, or a placeholder such as N/A, null or a lone dash."],
  ["Mixed type", "A column holding more than one kind of value, e.g. numbers and text."],
  ["Outlier", "A numeric value far outside the typical range for its column."],
  ["Cardinality", "How many distinct values a column contains relative to its row count."],
];

export default function Resources() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Resources · Nadiifi";
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar onStart={() => navigate("/")} />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-8 pt-14">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
            Resources
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em]">
            Short guides for cleaner data
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Everything you need to get the most out of Nadiifi: how to shape a file, what the
            detectors look for and what the terminology means.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="h-9 rounded-md text-[13px] font-semibold shadow-glow">
              <Link to="/">Open the tool <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-md text-[13px]">
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border/70 bg-muted/30 py-12">
          <div className="mx-auto grid max-w-5xl gap-3 px-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((res) => (
              <article key={res.title} className="rounded-xl border border-border/70 bg-card p-4">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                  {res.tag}
                </span>
                <h2 className="mt-2 font-display text-[15px] font-semibold">{res.title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{res.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Glossary</h2>
            <dl className="mt-4 divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-card">
              {GLOSSARY.map(([term, def]) => (
                <div key={term} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <dt className="font-display text-[13px] font-semibold">{term}</dt>
                  <dd className="text-[13px] leading-relaxed text-muted-foreground">{def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 text-[12px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Nadiifi</span>
          <Link to="/how-it-works" className="ml-auto hover:text-foreground">How it works</Link>
        </div>
      </footer>
    </div>
  );
}
