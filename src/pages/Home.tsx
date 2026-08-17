import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Undo2, Download, RotateCcw, Sparkles, ShieldCheck, Zap, Gauge } from "lucide-react";
import { Navbar } from "@/components/nadiifi/Navbar";
import { WorkflowNav, type Step } from "@/components/nadiifi/WorkflowNav";
import { EmptyDropzone } from "@/components/workspace/EmptyDropzone";
import { InspectingOverlay } from "@/components/workspace/InspectingOverlay";
import { InspectionPanel } from "@/components/workspace/InspectionPanel";
import { CleanSummary } from "@/components/workspace/CleanSummary";
import { ExportPanel } from "@/components/workspace/ExportPanel";
import { InsightsView } from "@/components/workspace/InsightsView";
import { KpiStrip } from "@/components/workspace/KpiStrip";
import { StatusBar } from "@/components/workspace/StatusBar";
import { CloudLibrary } from "@/components/workspace/CloudLibrary";
import { AutoCharts } from "@/components/charts/AutoCharts";
import { DatasetTable } from "@/components/app/DatasetTable";
import { Button } from "@/components/ui/button";
import { parseFile } from "@/lib/cleanlab/parse";
import { profileDataset } from "@/lib/cleanlab/profile";
import { detectIssues } from "@/lib/cleanlab/issues";
import { applyOperation, operationLabel } from "@/lib/cleanlab/operations";
import { exportCSV } from "@/lib/cleanlab/exporters";
import { buildSampleFile } from "@/lib/cleanlab/sample";
import type { Dataset, Issue } from "@/lib/cleanlab/types";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useAuth } from "@/lib/auth/AuthProvider";
import { upsertSavedDataset } from "@/lib/cloud/datasets";

type Stage = "empty" | "inspecting" | "ready" | "cleaned";

interface CleanRecord {
  before: Dataset;
  after: Dataset;
  cellsEdited: number;
}

function countCellDiff(a: Dataset, b: Dataset): number {
  const commonCols = a.columns
    .map((c) => c.name)
    .filter((c) => b.columns.some((cc) => cc.name === c));
  const n = Math.min(a.rows.length, b.rows.length);
  let diff = 0;
  for (let i = 0; i < n; i++) {
    for (const c of commonCols) {
      if (String(a.rows[i]?.[c] ?? "") !== String(b.rows[i]?.[c] ?? "")) diff++;
    }
  }
  return diff;
}

const PROMISES = [
  { icon: ShieldCheck, title: "Private by design", body: "Your file never leaves the browser. No uploads, no servers, no waiting." },
  { icon: Zap, title: "Instant profiling", body: "Types, missing values, duplicates and outliers detected the moment you drop a file." },
  { icon: Gauge, title: "Analysis-ready output", body: "Download clean CSV, Excel or JSON that drops straight into your next tool." },
];

export default function Home() {
  const { user } = useAuth();
  const toolRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("data");
  const [stage, setStage] = useState<Stage>("empty");
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [cleanResult, setCleanResult] = useState<CleanRecord | null>(null);
  const [undoStack, setUndoStack] = useState<Dataset[]>([]);
  const [libraryVersion, setLibraryVersion] = useState(0);

  const addDataset = useDatasetStore((s) => s.addDataset);
  const logExport = useDatasetStore((s) => s.logExport);

  const issues: Issue[] = useMemo(() => (dataset ? detectIssues(dataset) : []), [dataset]);

  useEffect(() => {
    if (step === "clean" && dataset) {
      setSelected(new Set(issues.filter((i) => i.op).map((i) => i.id)));
    }
  }, [step, dataset, issues]);

  const syncCloud = async (ds: Dataset) => {
    if (!user) return;
    try {
      await upsertSavedDataset(user.id, ds);
      setLibraryVersion((v) => v + 1);
    } catch (err) {
      console.error("cloud sync failed", err);
      toast.error("Couldn't save to your cloud workspace.");
    }
  };

  const scrollToTool = () => toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleFile = async (file: File) => {
    setStage("inspecting");
    scrollToTool();
    try {
      const rows = await parseFile(file);
      if (!rows || rows.length === 0) {
        toast.error("The file appears to be empty.");
        setStage("empty");
        return;
      }
      const ds = profileDataset(file.name.replace(/\.[^.]+$/, ""), rows, file.size);
      setDataset(ds);
      setUndoStack([]);
      setLastAction(null);
      setCleanResult(null);
      setStage("ready");
      setStep("clean");
      addDataset(ds).catch(() => {});
      syncCloud(ds);
      toast.success(`${ds.rows.length.toLocaleString()} rows loaded`);
    } catch (err) {
      console.error(err);
      toast.error("Could not read that file.");
      setStage("empty");
    }
  };

  const runClean = () => {
    if (!dataset || selected.size === 0) return;
    const before = dataset;
    let working = dataset;
    const applied: string[] = [];
    for (const issue of issues) {
      if (!selected.has(issue.id) || !issue.op) continue;
      working = applyOperation(working, issue.op);
      applied.push(operationLabel(issue.op));
    }
    setUndoStack((s) => [...s, before]);
    setDataset(working);
    setLastAction(applied[applied.length - 1] ?? null);
    setCleanResult({ before, after: working, cellsEdited: countCellDiff(before, working) });
    setStage("cleaned");
    setSelected(new Set());
    syncCloud(working);
    toast.success(`Applied ${applied.length} fixes`);
  };

  const handleUndo = () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setUndoStack((s) => s.slice(0, -1));
    setDataset(last);
    setCleanResult(null);
    setStage("ready");
    setLastAction("Reverted");
    toast("Reverted last cleaning step");
  };

  const handleDownload = () => {
    if (!dataset) return;
    exportCSV(dataset);
    logExport({ datasetId: dataset.id, datasetName: dataset.name, format: "csv" });
  };

  const handleReset = () => {
    setDataset(null);
    setStage("empty");
    setSelected(new Set());
    setCleanResult(null);
    setUndoStack([]);
    setLastAction(null);
    setStep("data");
  };

  const openFromCloud = (ds: Dataset) => {
    setDataset(ds);
    setUndoStack([]);
    setLastAction(null);
    setCleanResult(null);
    setStage("ready");
    setSelected(new Set());
    setStep("clean");
    toast.success(`Opened "${ds.name}"`);
  };

  const renderStep = () => {
    if (stage === "inspecting") return <InspectingOverlay />;
    if (!dataset) return null;

    if (step === "data") {
      return (
        <div className="space-y-4">
          <KpiStrip dataset={dataset} />
          <DatasetTable dataset={dataset} />
        </div>
      );
    }

    if (step === "clean") {
      return (
        <div className="space-y-4">
          {stage === "cleaned" && cleanResult ? (
            <CleanSummary
              before={cleanResult.before}
              after={cleanResult.after}
              cellsEdited={cleanResult.cellsEdited}
              onDismiss={() => setStage("ready")}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <DatasetTable dataset={dataset} />
              <InspectionPanel
                issues={issues}
                selected={selected}
                onToggle={(id) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    next.has(id) ? next.delete(id) : next.add(id);
                    return next;
                  })
                }
                onSelectAll={() => setSelected(new Set(issues.filter((i) => i.op).map((i) => i.id)))}
                onClear={() => setSelected(new Set())}
              />
            </div>
          )}
          {stage === "cleaned" && <DatasetTable dataset={dataset} />}
        </div>
      );
    }

    if (step === "analyze") {
      return (
        <div className="space-y-4">
          <KpiStrip dataset={dataset} />
          <InsightsView dataset={dataset} />
        </div>
      );
    }

    if (step === "visualize") return <AutoCharts dataset={dataset} />;

    return (
      <div className="space-y-6">
        <ExportPanel dataset={dataset} />
        <DatasetTable dataset={dataset} />
      </div>
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar onStart={scrollToTool} />

      {dataset && (
        <WorkflowNav active={step} onChange={setStep} disabled={stage === "inspecting"} />
      )}

      <main className="flex-1">
        {!dataset && (
          <section id="top" className="mx-auto max-w-5xl px-4 pb-6 pt-14 text-center">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Clean data. See clearly.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground">
              Drop a messy CSV, Excel or JSON file. Nadiifi profiles it, flags the problems and
              hands back analysis-ready data — entirely in your browser.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button size="sm" className="h-9 rounded-md text-[13px] font-semibold shadow-glow" onClick={() => handleFile(buildSampleFile())}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Try sample data
              </Button>
              <Button size="sm" variant="outline" className="h-9 rounded-md text-[13px]" onClick={scrollToTool}>
                Upload your file
              </Button>
            </div>
          </section>
        )}

        <div ref={toolRef} id="tool" className="mx-auto w-full max-w-5xl px-4 pb-12">
          {dataset ? (
            <div className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-auto truncate font-display text-[15px] font-semibold">
                  {dataset.name}
                </span>
                {step === "clean" && stage !== "cleaned" && (
                  <Button size="sm" className="h-8 text-[13px]" onClick={runClean} disabled={selected.size === 0}>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Clean {selected.size > 0 ? `(${selected.size})` : ""}
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-8 text-[13px]" onClick={handleUndo} disabled={undoStack.length === 0}>
                  <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Undo
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-[13px]" onClick={handleDownload}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-[13px]" onClick={handleReset}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New file
                </Button>
              </div>
              {renderStep()}
            </div>
          ) : stage === "inspecting" ? (
            <InspectingOverlay />
          ) : (
            <>
              <EmptyDropzone onFile={handleFile} onSample={() => handleFile(buildSampleFile())} />
              {user && (
                <div className="mt-8">
                  <CloudLibrary currentId={null} onOpen={openFromCloud} refreshToken={libraryVersion} />
                </div>
              )}
            </>
          )}
        </div>

        {!dataset && (
          <>
            <section id="how" className="border-t border-border/70 bg-muted/30 py-12">
              <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3">
                {PROMISES.map((p) => (
                  <div key={p.title}>
                    <p.icon className="h-5 w-5 text-primary" />
                    <h2 className="mt-3 font-display text-[15px] font-semibold">{p.title}</h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="detects" className="py-12">
              <div className="mx-auto max-w-5xl px-4">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">What Nadiifi detects</h2>
                <ul className="mt-4 grid gap-2 text-[13px] text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    "Duplicate rows and columns",
                    "Missing and blank values",
                    "Leading and trailing whitespace",
                    "Inconsistent capitalisation",
                    "Numbers stored as text",
                    "Unparseable dates",
                    "Statistical outliers",
                    "Empty rows and columns",
                    "Mixed data types",
                  ].map((f) => (
                    <li key={f} className="rounded-md border border-border/70 bg-card px-3 py-2">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}
      </main>

      <StatusBar dataset={dataset} lastAction={lastAction} />
    </div>
  );
}
