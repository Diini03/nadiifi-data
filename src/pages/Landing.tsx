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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CleanLab AI</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Reviews</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/dashboard">Dashboard</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/app/upload">Start cleaning <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full px-3 py-1">
              <Zap className="h-3 w-3" /> Now with AI-powered cleaning suggestions
            </Badge>
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Upload dirty data.
              <br />
              <span className="text-gradient">Get clean insights.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              Automatically detect missing values, duplicates, outliers, invalid formats, and prepare
              datasets for analytics — all in your browser.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 rounded-full px-6 shadow-glow">
                <Link to="/app/upload">
                  <Upload className="h-4 w-4" />
                  Upload Dataset
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-6">
                <Link to="/app/dashboard">Start Cleaning</Link>
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="overflow-hidden rounded-3xl border bg-card shadow-elevated">
              <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <div className="ml-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> customers_q4.csv
                </div>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-3">
                {[
                  { label: "Rows", value: "24,891" },
                  { label: "Issues found", value: "12" },
                  { label: "Cleaning score", value: "94" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border bg-background p-4">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    <div className="mt-2 text-2xl font-semibold">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t p-6">
                {[
                  { s: "warning", t: "312 duplicate rows detected", r: "Remove" },
                  { s: "info", t: "email column has 4 invalid formats", r: "Fix" },
                  { s: "critical", t: "signup_date has 8.2% missing values", r: "Impute" },
                ].map((i) => (
                  <div key={i.t} className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${
                        i.s === "critical" ? "bg-destructive" : i.s === "warning" ? "bg-warning" : "bg-info"
                      }`} />
                      {i.t}
                    </div>
                    <Badge variant="outline">{i.r}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything analysts need. Nothing they don't.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A production-grade cleaning workflow, in one polished interface.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full p-6 shadow-soft transition-shadow hover:shadow-card">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-y bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Trusted by data teams</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.author} className="p-6 shadow-soft">
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 text-sm">
                  <div className="font-medium">{t.author}</div>
                  <div className="text-muted-foreground">{t.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Frequently asked</h2>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center text-white shadow-elevated md:p-16">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to clean your data?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Drop a file in and see your first cleaning report in under 10 seconds.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 gap-2 rounded-full">
            <Link to="/app/upload">
              <Upload className="h-4 w-4" /> Upload Dataset
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium">CleanLab AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CleanLab AI · Built for analysts
          </p>
        </div>
      </footer>
    </div>
  );
}
