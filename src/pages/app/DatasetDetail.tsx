import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useDatasetStore } from "@/store/useDatasetStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/app/StatCard";
import { IssueCard } from "@/components/app/IssueCard";
import { DatasetTable } from "@/components/app/DatasetTable";
import { ColumnDrawer } from "@/components/app/ColumnDrawer";
import { AutoCharts } from "@/components/charts/AutoCharts";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { EmptyState } from "@/components/app/EmptyState";
import {
  Rows3,
  Columns3,
  AlertTriangle,
  Gauge,
  Undo2,
  Redo2,
  Trash2,
  Download,
  FileJson,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import { formatBytes, formatNumber } from "@/lib/format";
import { cleaningScore, detectIssues } from "@/lib/cleanlab/issues";
import type { Column, Issue } from "@/lib/cleanlab/types";
import { exportCSV, exportJSON, exportXLSX } from "@/lib/cleanlab/exporters";
import { supabase } from "@/integrations/supabase/client";

const TABS = ["overview", "columns", "cleaning", "visualize", "export"] as const;
type Tab = (typeof TABS)[number];

export default function DatasetDetail() {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const navigate = useNavigate();
  const {
    current,
    history,
    future,
    loading,
    loadDataset,
    applyOp,
    undo,
    redo,
    removeDataset,
    logExport,
  } = useDatasetStore();

  const [selectedCol, setSelectedCol] = useState<Column | null>(null);
  const [fixing, setFixing] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const activeTab: Tab = (TABS as readonly string[]).includes(tab ?? "")
    ? (tab as Tab)
    : "overview";

  useEffect(() => {
    if (id) loadDataset(id);
  }, [id, loadDataset]);

  useEffect(() => {
    if (current) document.title = `${current.name} · NadiifiData`;
  }, [current]);

  if (loading || !current) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const issues = detectIssues(current);
  const score = cleaningScore(current);

  const onFix = async (issue: Issue) => {
    if (!issue.op) return;
    setFixing(issue.id);
    try {
      await applyOp(issue.op);
      toast.success("Fixed", { description: issue.title });
    } catch (e: any) {
      toast.error("Couldn't apply fix", { description: e?.message || "Try again." });
    } finally {
      setFixing(null);
    }
  };

  const runAi = async (mode: "summary" | "suggest") => {
    setAiLoading(true);
    setAiText("");
    try {
      const digest = {
        name: current.name,
        rows: current.rows.length,
        columns: current.columns.map((c) => ({
          name: c.name,
          type: c.type,
          missingPct: +c.stats.missingPct.toFixed(1),
          unique: c.stats.unique,
          mean: c.stats.mean,
          std: c.stats.std,
        })),
        issues: issues.slice(0, 20).map((i) => ({ title: i.title, severity: i.severity })),
      };
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: { mode, digest },
      });
      if (error) throw error;
      setAiText(data.text || "No response.");
    } catch (e: any) {
      toast.error("Assistant unavailable", {
        description: "You can still clean manually. Try again shortly.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const doExport = (fmt: "csv" | "xlsx" | "json" | "pdf") => {
    try {
      if (fmt === "csv") exportCSV(current);
      else if (fmt === "xlsx") exportXLSX(current);
      else if (fmt === "json") exportJSON(current);
      else window.print();
      logExport({ datasetId: current.id, datasetName: current.name, format: fmt });
      toast.success(`Exported as ${fmt.toUpperCase()}`);
    } catch (e: any) {
      toast.error("Export failed", { description: e?.message || "Try again." });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      <PageHeader
        title={current.name}
        eyebrow={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="rounded-md font-mono text-[10px] tabular-nums">
              {current.columns.length} cols
            </Badge>
            <Badge variant="outline" className="rounded-md font-mono text-[10px] tabular-nums">
              {formatNumber(current.rows.length)} rows
            </Badge>
            <Badge variant="outline" className="rounded-md font-mono text-[10px]">
              {formatBytes(current.fileSize)}
            </Badge>
          </div>
        }
        className="no-print"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={history.length === 0}
              className="h-8 gap-1.5"
            >
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={future.length === 0}
              className="h-8 gap-1.5"
            >
              <Redo2 className="h-3.5 w-3.5" /> Redo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={async () => {
                if (confirm(`Delete "${current.name}"? This cannot be undone.`)) {
                  await removeDataset(current.id);
                  navigate("/app/dashboard");
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/app/datasets/${current.id}/${v}`)}
        className="no-print"
      >
        <TabsList className="h-9 w-full justify-start gap-0.5 rounded-md bg-muted p-0.5">
          {TABS.map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="h-8 flex-1 rounded-[6px] text-[13px] capitalize data-[state=active]:bg-background data-[state=active]:shadow-soft"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Rows" value={formatNumber(current.rows.length)} icon={Rows3} tone="primary" />
            <StatCard label="Columns" value={current.columns.length} icon={Columns3} />
            <StatCard
              label="Issues"
              value={issues.length}
              icon={AlertTriangle}
              tone={issues.length > 0 ? "warning" : "success"}
            />
            <StatCard
              label="Cleaning score"
              value={`${score}`}
              hint={score > 80 ? "Great shape" : score > 50 ? "Some issues" : "Needs cleaning"}
              icon={Gauge}
              tone={score > 80 ? "success" : score > 50 ? "warning" : "default"}
            />
          </div>

          <SectionCard
            title="AI summary"
            description="Get a plain-English overview of this dataset."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => runAi("summary")}
                disabled={aiLoading}
                className="h-8 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" /> {aiLoading ? "Thinking…" : "Generate"}
              </Button>
            }
          >
            {aiText ? (
              <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
                {aiText}
              </div>
            ) : (
              <EmptyState
                compact
                icon={Sparkles}
                title="No summary yet"
                description={'Click "Generate" to summarize this dataset with AI.'}
              />
            )}
          </SectionCard>

          <SectionCard title="Data preview" description="First rows of the current dataset.">
            <DatasetTable dataset={current} onColumnClick={setSelectedCol} />
          </SectionCard>
        </TabsContent>

        {/* COLUMNS */}
        <TabsContent value="columns" className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {current.columns.map((c) => (
              <Card
                key={c.name}
                className="cursor-pointer p-4 shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card"
                onClick={() => setSelectedCol(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedCol(c)}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium" title={c.name}>
                    {c.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {c.type}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">
                      {c.stats.missingPct.toFixed(1)}%
                    </span>{" "}
                    missing
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {formatNumber(c.stats.unique)}
                    </span>{" "}
                    unique
                  </div>
                  {c.stats.mean !== undefined && (
                    <>
                      <div>
                        μ{" "}
                        <span className="font-medium text-foreground">
                          {formatNumber(c.stats.mean)}
                        </span>
                      </div>
                      <div>
                        σ{" "}
                        <span className="font-medium text-foreground">
                          {formatNumber(c.stats.std)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CLEANING */}
        <TabsContent value="cleaning" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">
                {issues.length} detected issue{issues.length === 1 ? "" : "s"}
              </h2>
              <p className="text-xs text-muted-foreground">Each fix is reversible with Undo.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAi("suggest")}
              disabled={aiLoading}
              className="h-8 gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5" /> {aiLoading ? "Thinking…" : "Suggest with AI"}
            </Button>
          </div>

          {aiText && (
            <Card className="border-primary/30 bg-primary-soft/40 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-primary" /> AI suggestions
              </div>
              <div className="whitespace-pre-wrap text-foreground/80">{aiText}</div>
            </Card>
          )}

          {issues.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All clean"
              description="No issues detected. Your dataset is ready to export."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {issues.map((i) => (
                <IssueCard key={i.id} issue={i} onFix={() => onFix(i)} fixing={fixing === i.id} />
              ))}
            </div>
          )}

          {history.length > 0 && (
            <SectionCard title="Applied operations" description={`${history.length} step${history.length === 1 ? "" : "s"}`}>
              <ol className="space-y-1.5 text-sm">
                {history.map((h, i) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5"
                  >
                    <span>
                      <span className="text-muted-foreground">#{i + 1}</span> {h.label}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {h.rowsBefore.toLocaleString()} → {h.rowsAfter.toLocaleString()} rows
                    </span>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}
        </TabsContent>

        {/* VISUALIZE */}
        <TabsContent value="visualize" className="mt-6">
          <AutoCharts dataset={current} />
        </TabsContent>

        {/* EXPORT */}
        <TabsContent value="export" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { fmt: "csv", label: "CSV", icon: FileSpreadsheet, desc: "Universal spreadsheet format" },
                { fmt: "xlsx", label: "Excel", icon: FileSpreadsheet, desc: "Microsoft Excel workbook" },
                { fmt: "json", label: "JSON", icon: FileJson, desc: "Structured data for APIs" },
                { fmt: "pdf", label: "PDF report", icon: Printer, desc: "Printable cleaning report" },
              ] as const
            ).map((e) => (
              <Card
                key={e.fmt}
                className="flex flex-col justify-between p-5 shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <e.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold">{e.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{e.desc}</p>
                </div>
                <Button className="mt-4 h-8 w-full gap-1.5" size="sm" onClick={() => doExport(e.fmt)}>
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </Card>
            ))}
          </div>

          <SectionCard title="Cleaning report" description="Summary of applied operations.">
            <div className="grid gap-2 text-sm">
              <Row label="Dataset" value={current.name} />
              <Row label="Rows" value={formatNumber(current.rows.length)} />
              <Row label="Columns" value={String(current.columns.length)} />
              <Row label="Cleaning score" value={`${score}/100`} />
              <Row label="Operations applied" value={String(history.length)} />
              <Row label="Remaining issues" value={String(issues.length)} />
            </div>
            {history.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Operations
                </div>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {history.map((h) => (
                    <li key={h.id}>{h.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ColumnDrawer column={selectedCol} onClose={() => setSelectedCol(null)} />
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
