import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileImage, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Dataset } from "@/lib/cleanlab/types";
import { composeDashboard, TEMPLATES, type TemplateId } from "@/lib/cleanlab/dashboard";
import { SpecChart } from "@/components/charts/SmartCharts";
import { confidenceLabel } from "@/lib/cleanlab/recommend";

type Theme = {
  board: string;
  header: string;
  title: string;
  subtitle: string;
  kpiGrid: string;
  kpiCard: string;
  kpiLabel: string;
  kpiValue: string;
  chartGrid: string;
  chartCard: string;
  chartTitle: string;
  insightCard: string;
};

const THEMES: Record<TemplateId, Theme> = {
  executive: {
    board: "space-y-5 rounded-xl bg-background p-6",
    header: "rounded-lg border-l-4 border-primary bg-muted/40 px-5 py-4",
    title: "h-auto border-none bg-transparent px-0 font-display text-3xl font-semibold tracking-[-0.03em] shadow-none focus-visible:ring-0",
    subtitle: "text-xs text-muted-foreground",
    kpiGrid: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
    kpiCard: "rounded-lg border-border/70 bg-muted/40 p-5 shadow-none",
    kpiLabel: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
    kpiValue: "mt-1.5 font-display text-3xl font-semibold tabular-nums",
    chartGrid: "grid gap-4 lg:grid-cols-2",
    chartCard: "p-5 shadow-soft",
    chartTitle: "text-[15px] font-semibold",
    insightCard: "border-l-4 border-primary p-5 shadow-soft",
  },
  analytical: {
    board: "space-y-3 rounded-xl bg-background p-4",
    header: "border-b border-border pb-2",
    title: "h-auto border-none bg-transparent px-0 font-mono text-xl font-semibold tracking-[-0.01em] shadow-none focus-visible:ring-0",
    subtitle: "font-mono text-[11px] text-muted-foreground",
    kpiGrid: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
    kpiCard: "rounded-md border-border p-3 shadow-none",
    kpiLabel: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
    kpiValue: "mt-0.5 font-mono text-xl font-semibold tabular-nums",
    chartGrid: "grid gap-3 lg:grid-cols-2",
    chartCard: "rounded-md p-3 shadow-none",
    chartTitle: "text-[13px] font-semibold",
    insightCard: "rounded-md p-3 shadow-none",
  },
  story: {
    board: "mx-auto max-w-4xl space-y-6 rounded-xl bg-background p-6",
    header: "text-center",
    title: "h-auto border-none bg-transparent px-0 text-center font-display text-[32px] font-semibold leading-tight tracking-[-0.03em] shadow-none focus-visible:ring-0",
    subtitle: "text-center text-[12.5px] text-muted-foreground",
    kpiGrid: "grid gap-4 sm:grid-cols-3",
    kpiCard: "border-none bg-transparent p-0 text-center shadow-none",
    kpiLabel: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground",
    kpiValue: "mt-1 font-display text-3xl font-semibold tabular-nums",
    chartGrid: "grid gap-6",
    chartCard: "border-none p-0 shadow-none",
    chartTitle: "text-[16px] font-semibold",
    insightCard: "border-none bg-muted/40 p-6 shadow-none",
  },
  minimal: {
    board: "space-y-8 rounded-xl bg-background p-8",
    header: "",
    title: "h-auto border-none bg-transparent px-0 font-display text-2xl font-medium tracking-[-0.02em] shadow-none focus-visible:ring-0",
    subtitle: "text-[11.5px] text-muted-foreground",
    kpiGrid: "grid gap-8 sm:grid-cols-3",
    kpiCard: "border-none bg-transparent p-0 shadow-none",
    kpiLabel: "text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground",
    kpiValue: "mt-1 font-display text-2xl font-medium tabular-nums",
    chartGrid: "grid gap-8 lg:grid-cols-2",
    chartCard: "border-none p-0 shadow-none",
    chartTitle: "text-[13.5px] font-medium",
    insightCard: "border-none bg-transparent p-0 shadow-none",
  },
};

export function DashboardView({ dataset }: { dataset: Dataset }) {
  const [template, setTemplate] = useState<TemplateId>("executive");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [exporting, setExporting] = useState<null | "pdf" | "png">(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const spec = useMemo(() => composeDashboard(dataset, template), [dataset, template]);
  const theme = THEMES[template];
  const title = customTitle ?? spec.title;
  const cards = spec.cards.filter((c) => !hidden.has(c.spec.id));

  const capture = async () => {
    const el = boardRef.current;
    if (!el) return null;
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(el, {
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      scale: 2,
      logging: false,
      useCORS: true,
    });
  };

  const exportPng = async () => {
    setExporting("png");
    try {
      const canvas = await capture();
      if (!canvas) return;
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
      toast.success("Dashboard image downloaded");
    } catch {
      toast.error("We couldn't render the dashboard image. Try removing a chart and retrying.");
    } finally {
      setExporting(null);
    }
  };

  const exportPdf = async () => {
    setExporting("pdf");
    try {
      const canvas = await capture();
      if (!canvas) return;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const maxW = pw - margin * 2;
      const maxH = ph - margin * 2 - 34;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;

      pdf.setFontSize(15);
      pdf.text(title, margin, margin + 4);
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(
        `${dataset.name} · ${dataset.rows.length.toLocaleString()} rows · ${dataset.columns.length} columns · generated by Nadiifi`,
        margin,
        margin + 18,
      );
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin + 30, w, h);
      pdf.save(`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast.success("Dashboard PDF downloaded");
    } catch {
      toast.error("We couldn't build the PDF. Try the PNG export instead.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3 p-3 shadow-soft">
        <div className="flex flex-wrap gap-1">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.description}
              onClick={() => setTemplate(t.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                template === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportPng} disabled={exporting !== null} className="gap-1.5">
            {exporting === "png" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileImage className="h-3.5 w-3.5" />}
            PNG
          </Button>
          <Button size="sm" onClick={exportPdf} disabled={exporting !== null} className="gap-1.5">
            {exporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export PDF
          </Button>
        </div>
      </Card>

      <div ref={boardRef} className={theme.board}>
        <div className={theme.header}>
          <Input
            aria-label="Dashboard title"
            value={title}
            onChange={(e) => setCustomTitle(e.target.value)}
            className={theme.title}
          />
          <p className={theme.subtitle}>
            {spec.domain !== "General" ? `${spec.domain} dataset · ` : ""}
            {dataset.rows.length.toLocaleString()} rows · {dataset.columns.length} columns · composed from cleaned data
          </p>
        </div>

        <div className={theme.kpiGrid}>
          {spec.kpis.map((k) => (
            <Card key={k.id} className={theme.kpiCard}>
              <div className={theme.kpiLabel}>{k.label}</div>
              <div className={theme.kpiValue}>{k.value}</div>
              <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{k.hint}</div>
            </Card>
          ))}
        </div>

        <div className={theme.chartGrid}>
          {cards.map(({ spec: c, span }) => {
            const conf = confidenceLabel(c.confidence);
            return (
              <Card key={c.id} className={cn(theme.chartCard, span === 2 && "lg:col-span-2")}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={cn("truncate", theme.chartTitle)}>{c.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.subtitle}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", conf.tone)}>{conf.label}</span>
                    <button
                      type="button"
                      onClick={() => setHidden((s) => new Set(s).add(c.id))}
                      className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      remove
                    </button>
                  </div>
                </div>
                <SpecChart spec={c} height={span === 2 ? (template === "story" ? 340 : 280) : 220} />
              </Card>
            );
          })}
        </div>

        <Card className={theme.insightCard}>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            What stands out
          </div>
          <ul className={cn("space-y-1.5 text-muted-foreground", template === "story" ? "text-[15px] leading-relaxed" : "text-sm")}>
            {spec.insights.map((i, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Every statement is calculated from the cleaned dataset — no estimates.
          </p>
        </Card>
      </div>

      {hidden.size > 0 && (
        <Button size="sm" variant="ghost" onClick={() => setHidden(new Set())}>
          Restore {hidden.size} removed chart{hidden.size > 1 ? "s" : ""}
        </Button>
      )}
    </div>
  );
}
