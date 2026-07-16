import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sparkles,
  Upload,
  ScanSearch,
  Wand2,
  BarChart3,
  Download,
  Shield,
  Zap,
  ArrowRight,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const features = [
  { icon: ScanSearch, title: "Automatic profiling", desc: "Instant stats, types, and distributions across every column." },
  { icon: Wand2, title: "One-click fixes", desc: "Remove duplicates, fill nulls, trim, standardize — with undo." },
  { icon: Shield, title: "Outlier detection", desc: "IQR and z-score methods highlight suspicious data points." },
  { icon: BarChart3, title: "Auto visualizations", desc: "Histograms, scatter plots, and correlation heatmaps out of the box." },
  { icon: Sparkles, title: "AI insights", desc: "Explain issues and suggest cleaning steps in plain English." },
  { icon: Download, title: "Export anywhere", desc: "CSV, Excel, JSON, and printable cleaning reports." },
];

const testimonials = [
  { quote: "Cut our data prep time by 80%. Our analysts ship insights, not spreadsheets.", author: "Priya S.", role: "Head of Analytics" },
  { quote: "The cleaning studio feels like Stripe for data. Simply beautiful.", author: "Marco T.", role: "Data Engineer" },
  { quote: "Finally, a tool my non-technical team can actually use.", author: "Alex R.", role: "Operations Lead" },
];

const faqs = [
  { q: "Does my data leave the browser?", a: "No. Parsing, profiling, and cleaning run entirely in your browser. Files never touch our servers — the only exception is when you use AI insights, which sends anonymized column statistics only." },
  { q: "What file formats are supported?", a: "CSV, TSV, Excel (.xlsx/.xls), and JSON up to about 50 MB comfortably." },
  { q: "Can I undo an operation?", a: "Yes. Every cleaning operation is fully reversible with unlimited undo and redo." },
  { q: "Do I need an account?", a: "Not to try it. Your datasets are stored locally in your browser." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            to="/"
            className="group flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-90"
            aria-label="NadiifiData home"
          >
            <Logo size={26} withWordmark wordmarkClassName="text-[15px]" />
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-full border border-border/60 bg-background/60 px-1.5 py-1 shadow-soft backdrop-blur md:flex"
            aria-label="Primary"
          >
            {[
              { href: "#features", label: "Features" },
              { href: "#testimonials", label: "Reviews" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden h-9 px-3 text-[13px] font-medium sm:inline-flex">
              <Link to="/app/dashboard">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="h-9 gap-1.5 rounded-full px-4 text-[13px] font-medium shadow-sm">
              <Link to="/app/upload">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full border border-border/50 bg-background px-3 py-1 text-xs shadow-soft">
              <Zap className="h-3 w-3 text-primary" /> Now with AI-powered cleaning suggestions
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-[56px] lg:leading-[1.05]">
              Upload messy data.
              <br />
              <span className="text-gradient">Download analysis-ready data.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
              Automatically detect missing values, duplicates, outliers, and invalid formats — all in your browser.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Button asChild size="lg" className="h-11 gap-2 rounded-md px-5 shadow-glow">
                <Link to="/app/upload">
                  <Upload className="h-4 w-4" />
                  Upload dataset
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 gap-2 rounded-md px-5">
                <Link to="/app/dashboard">Open dashboard</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["No signup required", "Runs 100% in browser", "CSV · Excel · JSON"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-14 max-w-5xl"
          >
            <div className="overflow-hidden rounded-xl border bg-card shadow-elevated">
              <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <div className="ml-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> customers_q4.csv
                </div>
              </div>
              <div className="grid gap-3 p-5 md:grid-cols-3">
                {[
                  { label: "Rows", value: "24,891" },
                  { label: "Issues found", value: "12" },
                  { label: "Cleaning score", value: "94" },
                ].map((s) => (
                  <div key={s.label} className="rounded-md border bg-background p-4">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-1.5 text-2xl font-semibold tracking-tight">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t p-5">
                {[
                  { s: "warning", t: "312 duplicate rows detected", r: "Remove" },
                  { s: "info", t: "email column has 4 invalid formats", r: "Fix" },
                  { s: "critical", t: "signup_date has 8.2% missing values", r: "Impute" },
                ].map((i) => (
                  <div
                    key={i.t}
                    className="flex items-center justify-between rounded-md border bg-background px-4 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          i.s === "critical"
                            ? "bg-destructive"
                            : i.s === "warning"
                            ? "bg-warning"
                            : "bg-info"
                        }`}
                      />
                      {i.t}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {i.r}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Everything analysts need. Nothing they don't.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            A production-grade cleaning workflow, in one polished interface.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card className="h-full p-5 shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <f.icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-y bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Trusted by data teams</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.author} className="p-5 shadow-soft">
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 text-sm">
                  <div className="font-medium">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 md:px-6 md:py-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Frequently asked</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-primary p-10 text-center text-white shadow-elevated md:p-14">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready to clean your data?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 md:text-base">
            Drop a file in and see your first cleaning report in under 10 seconds.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7 h-11 gap-2 rounded-md">
            <Link to="/app/upload">
              <Upload className="h-4 w-4" /> Upload dataset
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row md:px-6">
          <Logo size={20} withWordmark wordmarkClassName="text-[13px]" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NadiifiData · Clean data. Better decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
