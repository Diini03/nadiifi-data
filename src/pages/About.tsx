import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Gauge, Eye } from "lucide-react";
import { Navbar } from "@/components/nadiifi/Navbar";
import { SiteFooter } from "@/components/nadiifi/SiteFooter";
import { Button } from "@/components/ui/button";

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "A dataset is often the most sensitive file a team owns. Nadiifi reads it in the browser and never ships it to a server unless you explicitly save it.",
  },
  {
    icon: Eye,
    title: "Nothing happens invisibly",
    body: "Every fix is listed, explained and optional. You approve the changes; the tool never rewrites a column behind your back.",
  },
  {
    icon: Zap,
    title: "Fast enough to stay in flow",
    body: "Profiling starts the moment a file lands. No queue, no upload bar, no waiting for a job to finish.",
  },
  {
    icon: Gauge,
    title: "Output you can trust",
    body: "Column names and inferred types stay consistent from screen to export, so downstream scripts and dashboards keep working.",
  },
];

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "About · Nadiifi";
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar onStart={() => navigate("/")} />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pb-8 pt-14">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
            About
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em]">
            Built for the hour before the analysis
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Most analysis work is not analysis. It is renaming columns, hunting duplicates and
            deciding what to do with blank cells. Nadiifi exists to make that hour short, visible
            and repeatable — without moving your data anywhere.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="h-9 rounded-md text-[13px] font-semibold shadow-glow">
              <Link to="/">Clean a file <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-md text-[13px]">
              <Link to="/how-it-works">See the workflow</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border/70 bg-muted/30 py-12">
          <div className="mx-auto grid max-w-5xl gap-3 px-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <article key={p.title} className="rounded-xl border border-border/70 bg-card p-5">
                <p.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-display text-[15px] font-semibold">{p.title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">How it is built</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              Nadiifi is a browser application. Files are parsed with SheetJS and Papaparse, profiled
              with a semantic type engine that separates identifiers from measures, and charted with
              Recharts. Saved datasets — an opt-in feature for signed-in users — are the only data
              that ever leaves the device.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              The name comes from the Somali word <em>nadiifi</em>: to clean.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
