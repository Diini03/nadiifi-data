import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/nadiifi/SiteFooter";
import { Undo2, Download, RotateCcw, Sparkles, ShieldCheck, Zap, Gauge, ArrowRight, Check, FileSpreadsheet, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/nadiifi/Navbar";
import { WorkflowNav, type Step } from "@/components/nadiifi/WorkflowNav";
import { EmptyDropzone } from "@/components/workspace/EmptyDropzone";
import { InspectingOverlay } from "@/components/workspace/InspectingOverlay";
import { InspectionPanel } from "@/components/workspace/InspectionPanel";
import { CleanSummary } from "@/components/workspace/CleanSummary";
import { ChangePreview } from "@/components/workspace/ChangePreview";
import { CleaningRecipes } from "@/components/workspace/CleaningRecipes";
import { DateReview } from "@/components/workspace/DateReview";
import { applyApproved, safeFormatting } from "@/lib/cleanlab/review";
import { useWorkspacePersistence } from "@/lib/cloud/useWorkspacePersistence";
import { CleanSuggestions } from "@/components/workspace/CleanSuggestions";
import { BlankFillReview } from "@/components/workspace/BlankFillReview";
import { CategoryOverrides } from "@/components/workspace/CategoryOverrides";
import { DuplicateReview } from "@/components/workspace/DuplicateReview";
import { DatasetBuilder } from "@/components/workspace/DatasetBuilder";
import { ExportPanel } from "@/components/workspace/ExportPanel";
import { InsightsView } from "@/components/workspace/InsightsView";
import { KpiStrip } from "@/components/workspace/KpiStrip";
import { StatusBar } from "@/components/workspace/StatusBar";
import { CloudLibrary } from "@/components/workspace/CloudLibrary";
import { SmartCharts } from "@/components/charts/SmartCharts";
import { ColumnIntelligence } from "@/components/workspace/ColumnIntelligence";
import { AiSummary } from "@/components/workspace/AiSummary";
import { DashboardView } from "@/components/workspace/DashboardView";
import { DatasetTable } from "@/components/app/DatasetTable";
import { Button } from "@/components/ui/button";
import { parseFile } from "@/lib/cleanlab/parse";
import { profileDataset } from "@/lib/cleanlab/profile";
import { detectIssues } from "@/lib/cleanlab/issues";
import { operationLabel } from "@/lib/cleanlab/operations";
import { exportCSV } from "@/lib/cleanlab/exporters";
import { buildSampleFile } from "@/lib/cleanlab/sample";
import type { CellValue, Dataset, Issue, Operation } from "@/lib/cleanlab/types";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useAuth } from "@/lib/auth/AuthProvider";
import { loadSavedDataset } from "@/lib/cloud/datasets";

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
  { icon: ShieldCheck, title: "Private by design", body: "Processing stays in your browser. Signed-in saves encrypt your rows; AI receives a limited summary." },
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
  const [libraryVersion] = useState(0);
  const [pending, setPending] = useState<Operation[] | null>(null);
  const persistence = useWorkspacePersistence(user?.id, dataset, step, undoStack, draft => {
    setDataset(draft.dataset); setStep(draft.step as Step); setUndoStack(draft.undo ?? []); setStage("ready");
  });

  const addDataset = useDatasetStore((s) => s.addDataset);
  const logExport = useDatasetStore((s) => s.logExport);

  const issues: Issue[] = useMemo(
    () => (dataset ? detectIssues(dataset).filter((i) => i.type !== "missing" && i.type !== "duplicates") : []),
    [dataset],
  );

  useEffect(() => {
    if (step === "clean" && dataset) {
      setSelected(new Set(issues.filter((i) => i.op && safeFormatting(i.op)).map((i) => i.id)));
    }
  }, [step, dataset, issues]);

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

      toast.success(`${ds.rows.length.toLocaleString()} rows loaded`);
    } catch (err) {
      console.error(err);
      toast.error("Could not read that file.");
      setStage("empty");
    }
  };

  const openBuilt = (name: string, rows: Record<string, CellValue>[]) => {
    const ds = profileDataset(name, rows, new Blob([JSON.stringify(rows)]).size);
    setDataset(ds);
    setUndoStack([]);
    setLastAction(null);
    setCleanResult(null);
    setStage("ready");
    setStep("clean");
    addDataset(ds).catch(() => {});

    toast.success(`${ds.rows.length} rows loaded`);
    scrollToTool();
  };

  const runClean = () => {
    setPending(issues.filter(i => selected.has(i.id) && i.op && !["duplicate_keys", "mixed_dates"].includes(i.type)).flatMap(i => i.op ? [i.op] : []));
  };
  const applyManual = (op: Operation) => setPending([op]);
  const approveChanges = () => {
    if (!dataset || !pending?.length) return;
    const before = dataset;
    const working = applyApproved(before, pending);
    setUndoStack(stack => [...stack, before]);
    setDataset(working);
    setLastAction(pending.map(operationLabel).join(", "));
    setCleanResult({before, after:working, cellsEdited:countCellDiff(before, working)});
    setStage("ready"); setSelected(new Set()); setPending(null);
    toast.success("Approved changes applied", {description:"Review remaining decisions or continue to Analyze."});
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

  // Open a saved dataset requested from the workspace page (/?open=<id>)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open");
    if (!id || !user) return;
    let cancelled = false;
    setStage("inspecting");
    loadSavedDataset(id)
      .then((ds) => {
        if (cancelled) return;
        if (ds) openFromCloud(ds);
        else {
          setStage("empty");
          toast.error("That dataset is no longer available.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStage("empty");
          toast.error("Couldn't open that dataset.");
        }
      })
      .finally(() => {
        window.history.replaceState({}, "", "/");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
          <CleaningRecipes key={dataset.id} dataset={dataset} owner={user?.id} onPreview={setPending} />
          {stage === "cleaned" && cleanResult ? (
            <CleanSummary
              before={cleanResult.before}
              after={cleanResult.after}
              cellsEdited={cleanResult.cellsEdited}
              onDismiss={() => setStage("ready")}
              onVisualize={() => setStep("visualize")}
            />

          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <DatasetTable dataset={dataset} />
              <InspectionPanel
                issues={issues.map(i => ["duplicate_keys", "mixed_dates"].includes(i.type) ? {...i, op:undefined} : i)}
                selected={selected}
                onToggle={(id) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    next.has(id) ? next.delete(id) : next.add(id);
                    return next;
                  })
                }
                onSelectAll={() => setSelected(new Set(issues.filter((i) => i.op && !["duplicate_keys", "mixed_dates"].includes(i.type)).map((i) => i.id)))}
                onClear={() => setSelected(new Set())}
              />
            </div>
          )}
          <h2 className="font-display text-lg font-semibold">Decisions to review</h2>
          <DateReview key={`dates:${dataset.updatedAt}`} dataset={dataset} onApply={applyManual} />
          <CleanSuggestions dataset={dataset} />
          <BlankFillReview key={`blanks:${dataset.updatedAt}`} dataset={dataset} onApply={applyManual} />
          <CategoryOverrides dataset={dataset} onApply={applyManual} />
          <DuplicateReview dataset={dataset} onApply={applyManual} />
          {!!dataset.audit?.length && <section className="border-t border-border pt-4"><h3 className="font-semibold">Changes already applied</h3><ul className="mt-2 space-y-2 text-sm text-muted-foreground">{dataset.audit.map((entry,i) => <li key={i}>{entry.labels.join(" · ")} — {entry.cells} cells changed; {entry.filled} filled values (estimates); {entry.removed} rows removed.</li>)}</ul></section>}
          {stage === "cleaned" && <DatasetTable dataset={dataset} />}
        </div>
      );
    }

    if (step === "analyze") {
      return (
        <div className="space-y-4">
          <KpiStrip dataset={dataset} />
          <p className="text-sm text-muted-foreground">{detectIssues(dataset).length} outstanding checks · {dataset.audit?.reduce((n,e)=>n+e.filled,0) ?? 0} approved estimated fills · {dataset.audit?.reduce((n,e)=>n+e.removed,0) ?? 0} removed rows. Findings use the current approved table.</p>
          <AiSummary dataset={dataset} />
          <ColumnIntelligence dataset={dataset} onChange={setDataset} />
          <InsightsView dataset={dataset} />
        </div>
      );
    }

    if (step === "visualize") {
      return (
        <div className="space-y-6">
          <DashboardView dataset={dataset} />
          <SmartCharts dataset={dataset} />
        </div>
      );
    }

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
        <WorkflowNav
          active={step}
          onChange={setStep}
          disabled={stage === "inspecting"}
          suggested={null}
        />
      )}


      <main className="flex-1">
        {!dataset && (
          <section id="top" className="mx-auto max-w-5xl px-4 pb-7 pt-9 text-center sm:pt-12">
            <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Your data, a little clearer.
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Nadiifi<span className="text-cyan">.</span>
            </h1>
            <p className="mt-2 font-display text-xl font-medium sm:text-2xl">Clean data. See clearly.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              From messy spreadsheets to findings you can trust.
              Review every fix. Find the story. Make it yours.
            </p>
          </section>
        )}

        <div ref={toolRef} id="tool" className="mx-auto w-full max-w-5xl scroll-mt-32 px-4 pb-10">
          {dataset ? (
            <div className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-auto truncate font-display text-[15px] font-semibold">
                  {dataset.name}
                </span>
                {step === "clean" && stage !== "cleaned" && (
                  <Button size="sm" className="h-8 text-[13px]" onClick={runClean} disabled={selected.size === 0}>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Review fixes {selected.size > 0 ? `(${selected.size})` : ""}
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <p className="text-sm text-muted-foreground">{dataset.rows.length.toLocaleString()} rows · {step === "clean" ? `${detectIssues(dataset).length} outstanding checks` : `Current stage: ${step}`}</p>
                <div className="flex items-center gap-2 text-xs"><span role="status">{persistence.status}</span>{persistence.status === "Save failed" && <Button size="sm" variant="outline" onClick={persistence.retry}>Retry save</Button>}{!user && <Button size="sm" variant="outline" asChild><Link to="/auth" state={{from:"/"}}>Sign in to save privately</Link></Button>}</div>
              </div>
              <div key={step}>{renderStep()}</div>
              <div className="flex justify-end border-t border-border pt-4"><Button onClick={() => setStep(({data:"clean", clean:"analyze", analyze:"visualize", visualize:"export", export:"data"} as const)[step])}>{({data:"Review cleaning",clean:"Examine findings",analyze:"Create charts",visualize:"Export results",export:"Back to data"} as const)[step]}</Button></div>
            </div>
          ) : stage === "inspecting" ? (
            <InspectingOverlay />
          ) : (
            <>
              <div className="mx-auto max-w-2xl">
                <EmptyDropzone onFile={handleFile} onSample={() => handleFile(buildSampleFile())} />
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                  <span>Starting from scratch?</span>
                  <DatasetBuilder onBuild={openBuilt} />
                </div>
              </div>
              <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between gap-1 border-t border-border pt-5 text-[11px] text-muted-foreground sm:text-xs" aria-label="Dataset journey">
                {[{label:"Your data",icon:FileSpreadsheet},{label:"Reviewed fixes",icon:Check},{label:"Clear findings",icon:BarChart3},{label:"Ready to share",icon:Download}].map((item,i) => <div key={item.label} className="flex items-center gap-2"><span className="flex flex-col items-center gap-2 sm:flex-row"><item.icon className={i === 1 ? "h-4 w-4 text-success" : "h-4 w-4 text-cyan"} />{item.label}</span>{i < 3 && <ArrowRight className="ml-2 hidden h-3 w-3 text-muted-foreground/50 sm:block" />}</div>)}
              </div>
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
            <section id="how" className="border-t border-border/70 bg-muted/30 py-10 sm:py-14">
              <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3 sm:gap-10">
                {PROMISES.map((p) => (
                  <div key={p.title}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card"><p.icon className="h-4 w-4 text-cyan" /></div>
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
                    <li key={f} className="flex items-center gap-2 border-b border-border/70 py-3">
                      <Check className="h-3.5 w-3.5 shrink-0 text-success" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="resources" className="border-t border-border/70 bg-muted/30 py-12">
              <div className="mx-auto max-w-5xl px-4">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Go deeper</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Dedicated pages for the workflow, the guides and the thinking behind Nadiifi.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { to: "/how-it-works", tag: "Workflow", title: "How it works", body: "The five stages a dataset moves through, and what each one changes." },
                    { to: "/resources", tag: "Guides", title: "Resources", body: "How to shape a file, what the detectors look for and a plain-English glossary." },
                    { to: "/about", tag: "Story", title: "About Nadiifi", body: "Why the tool runs in your browser and what it refuses to do with your data." },
                  ].map((res) => (
                    <Link
                      key={res.title}
                      to={res.to}
                      className="rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/50"
                    >
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                        {res.tag}
                      </span>
                      <h3 className="mt-2 font-display text-[15px] font-semibold">{res.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {res.body}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {!dataset && <SiteFooter />}


      {dataset && pending?.length ? <ChangePreview dataset={dataset} operations={pending} onClose={() => setPending(null)} onApprove={approveChanges} /> : null}
      <StatusBar dataset={dataset} lastAction={lastAction} />
    </div>
  );
}
