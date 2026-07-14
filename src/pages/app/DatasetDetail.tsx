import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import {
  Rows3,
  Columns3,
  AlertTriangle,
  Gauge,
  HardDrive,
  Undo2,
  Redo2,
  Trash2,
  Download,
  FileJson,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Wand2,
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
    if (current) document.title = `${current.name} · CleanLab AI`;
  }, [current]);

  if (loading || !current) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
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
      toast.success("Issue fixed", { description: issue.title });
    } catch (e: any) {
      toast.error("Failed to apply", { description: e?.message });
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
      toast.error("AI unavailable", { description: e?.message || "Try again shortly." });
    } finally {
      setAiLoading(false);
    }
  };

  const doExport = (fmt: "csv" | "xlsx" | "json" | "pdf") => {
    if (fmt === "csv") exportCSV(current);
    else if (fmt === "xlsx") exportXLSX(current);
    else if (fmt === "json") exportJSON(current);
    else window.print();
    logExport({ datasetId: current.id, datasetName: current.name, format: fmt });
    toast.success(`Exported as ${fmt.toUpperCase()}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">{current.columns.length} cols</Badge>
            <Badge variant="outline" className="rounded-full">{formatNumber(current.rows.length)} rows</Badge>
            <Badge variant="outline" className="rounded-full">{formatBytes(current.fileSize)}</Badge>
          </div>
          <h1 className="truncate text-3xl font-bold tracking-tight">{current.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} className="gap-1.5">
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={future.length === 0} className="gap-1.5">
            <Redo2 className="h-3.5 w-3.5" /> Redo
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={async () => {
              if (confirm(`Delete "${current.name}"? This cannot be undone.`)) {
                await removeDataset(current.id);
                navigate("/app/dashboard");
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/app/datasets/${current.id}/${v}`)}
        className="no-print"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="cleaning">Cleaning</TabsTrigger>
          <TabsTrigger value="visualize">Visualize</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Rows" value={formatNumber(current.rows.length)} icon={Rows3} tone="primary" />
            <StatCard label="Columns" value={current.columns.length} icon={Columns3} />
            <StatCard label="Issues" value={issues.length} icon={AlertTriangle} tone={issues.length > 0 ? "warning" : "success"} />
            <StatCard
              label="Cleaning score"
              value={`${score}/100`}
              icon={Gauge}
              tone={score > 80 ? "success" : score > 50 ? "warning" : "default"}
              hint={score > 80 ? "Great shape" : score > 50 ? "Some issues" : "Needs cleaning"}
            />
          </div>

          <Card className="p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">AI summary</h2>
                <p className="text-xs text-muted-foreground">Get a plain-English overview of this dataset.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => runAi("summary")} disabled={aiLoading} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> {aiLoading ? "Thinking…" : "Generate"}
              </Button>
            </div>
            {aiText ? (
              <div className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
                {aiText}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                Click "Generate" to summarize this dataset with AI.
              </div>
            )}
          </Card>

          <div>
            <h2 className="mb-3 font-semibold">Data preview</h2>
            <DatasetTable dataset={current} onColumnClick={setSelectedCol} />
          </div>
        </TabsContent>

        {/* COLUMNS */}
        <TabsContent value="columns" className="mt-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {current.columns.map((c) => (
              <Card
                key={c.name}
                className="cursor-pointer p-4 shadow-soft transition-shadow hover:shadow-card"
                onClick={() => setSelectedCol(c)}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{c.name}</span>
                  <Badge variant="outline" className="uppercase text-[10px]">{c.type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><span className="font-medium text-foreground">{c.stats.missingPct.toFixed(1)}%</span> missing</div>
                  <div><span className="font-medium text-foreground">{formatNumber(c.stats.unique)}</span> unique</div>
                  {c.stats.mean !== undefined && (
                    <>
                      <div>μ <span className="font-medium text-foreground">{formatNumber(c.stats.mean)}</span></div>
                      <div>σ <span className="font-medium text-foreground">{formatNumber(c.stats.std)}</span></div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CLEANING */}
        <TabsContent value="cleaning" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{issues.length} detected issues</h2>
              <p className="text-xs text-muted-foreground">
                Each fix is reversible with Undo.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => runAi("suggest")} disabled={aiLoading} className="gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> {aiLoading ? "Thinking…" : "Suggest with AI"}
            </Button>
          </div>

          {aiText && (
            <Card className="border-primary/30 bg-primary-soft/40 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-primary" /> AI suggestions
              </div>
              <div className="whitespace-pre-wrap text-muted-foreground">{aiText}</div>
            </Card>
          )}

          {issues.length === 0 ? (
            <Card className="p-10 text-center shadow-soft">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <Gauge className="h-6 w-6" />
              </div>
              <h3 className="font-medium">All clean!</h3>
              <p className="mt-1 text-sm text-muted-foreground">No issues detected. Ready to export.</p>
            </Card>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {issues.map((i) => (
                <IssueCard key={i.id} issue={i} onFix={() => onFix(i)} fixing={fixing === i.id} />
              ))}
            </div>
          )}

          {history.length > 0 && (
            <Card className="p-4 shadow-soft">
              <h3 className="mb-3 text-sm font-semibold">Applied operations</h3>
              <ol className="space-y-1.5 text-sm">
                {history.map((h, i) => (
                  <li key={h.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5">
                    <span>
                      <span className="text-muted-foreground">#{i + 1}</span> {h.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {h.rowsBefore.toLocaleString()} → {h.rowsAfter.toLocaleString()} rows
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </TabsContent>

        {/* VISUALIZE */}
        <TabsContent value="visualize" className="mt-6">
          <AutoCharts dataset={current} />
        </TabsContent>

        {/* EXPORT */}
        <TabsContent value="export" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {([
              { fmt: "csv", label: "CSV", icon: FileSpreadsheet, desc: "Universal spreadsheet format" },
              { fmt: "xlsx", label: "Excel", icon: FileSpreadsheet, desc: "Microsoft Excel workbook" },
              { fmt: "json", label: "JSON", icon: FileJson, desc: "Structured data for APIs" },
              { fmt: "pdf", label: "PDF report", icon: Printer, desc: "Printable cleaning report" },
            ] as const).map((e) => (
              <Card key={e.fmt} className="flex flex-col justify-between p-5 shadow-soft">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <e.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{e.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{e.desc}</p>
                </div>
                <Button className="mt-4 w-full gap-1.5" size="sm" onClick={() => doExport(e.fmt)}>
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-5 shadow-soft">
            <h3 className="mb-3 font-semibold">Cleaning report</h3>
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
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Operations</div>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {history.map((h) => <li key={h.id}>{h.label}</li>)}
                </ul>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <ColumnDrawer column={selectedCol} onClose={() => setSelectedCol(null)} />
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
