import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/workspace/TopBar";
import { IconRail, type RailView } from "@/components/workspace/IconRail";
import { StatusBar } from "@/components/workspace/StatusBar";
import { EmptyDropzone } from "@/components/workspace/EmptyDropzone";
import { InspectionPanel } from "@/components/workspace/InspectionPanel";
import { InspectingOverlay } from "@/components/workspace/InspectingOverlay";
import { ExportPanel } from "@/components/workspace/ExportPanel";
import { CleanSummary } from "@/components/workspace/CleanSummary";
import { HistoryView } from "@/components/workspace/HistoryView";
import { SettingsView } from "@/components/workspace/SettingsView";
import { DatasetTable } from "@/components/app/DatasetTable";
import { parseFile } from "@/lib/cleanlab/parse";
import { profileDataset } from "@/lib/cleanlab/profile";
import { detectIssues } from "@/lib/cleanlab/issues";
import { applyOperation, operationLabel } from "@/lib/cleanlab/operations";
import type { Dataset, Issue } from "@/lib/cleanlab/types";
import { useDatasetStore } from "@/store/useDatasetStore";
import { exportCSV } from "@/lib/cleanlab/exporters";
import { buildSampleFile } from "@/lib/cleanlab/sample";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { PanelRightOpen, Sheet as SheetIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type WorkspaceStage = "empty" | "inspecting" | "review" | "cleaned" | "export";

interface CleanRecord {
  before: Dataset;
  after: Dataset;
  cellsEdited: number;
}

function countCellDiff(a: Dataset, b: Dataset): number {
  const commonCols = a.columns.map((c) => c.name).filter((c) => b.columns.some((cc) => cc.name === c));
  const n = Math.min(a.rows.length, b.rows.length);
  let diff = 0;
  for (let i = 0; i < n; i++) {
    for (const c of commonCols) {
      if (String(a.rows[i]?.[c] ?? "") !== String(b.rows[i]?.[c] ?? "")) diff++;
    }
  }
  return diff;
}

export default function Workspace() {
  const { t } = useI18n();
  const [rail, setRail] = useState<RailView>("workspace");
  const [stage, setStage] = useState<WorkspaceStage>("empty");
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<CleanRecord | null>(null);
  const [undoStack, setUndoStack] = useState<Dataset[]>([]);
  const [mobileIssuesOpen, setMobileIssuesOpen] = useState(false);

  const addDataset = useDatasetStore((s) => s.addDataset);
  const logExport = useDatasetStore((s) => s.logExport);

  const issues: Issue[] = useMemo(() => (dataset ? detectIssues(dataset) : []), [dataset]);

  // Auto-select every actionable issue on load so "Clean Dataset" works out of the box.
  useEffect(() => {
    if (stage === "review" && dataset) {
      setSelected(new Set(issues.filter((i) => i.op).map((i) => i.id)));
    }
  }, [stage, dataset, issues]);

  const handleFile = async (file: File) => {
    setStage("inspecting");
    try {
      const rows = await parseFile(file);
      if (!rows || rows.length === 0) {
        toast.error("The file appears to be empty.");
        setStage("empty");
        return;
      }
      // slight delay so the scan animation is visible for tiny files
      await new Promise((r) => setTimeout(r, 350));
      const ds = profileDataset(file.name.replace(/\.[^.]+$/, ""), rows, file.size);
      setDataset(ds);
      setUndoStack([]);
      setLastAction(null);
      setCleanResult(null);
      setStage("review");
      addDataset(ds).catch(() => {});
      toast.success(`${ds.rows.length.toLocaleString()} rows loaded`);
    } catch (err) {
      console.error(err);
      toast.error("Could not read that file.");
      setStage("empty");
    }
  };

  const toggleIssue = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runClean = () => {
    if (!dataset || selected.size === 0) return;
    setCleaning(true);
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
    setCleanResult({
      before,
      after: working,
      cellsEdited: countCellDiff(before, working),
    });
    setStage("cleaned");
    setSelected(new Set());
    setCleaning(false);
    toast.success(`Applied ${applied.length} fixes`);
  };

  const handleDownload = () => {
    if (!dataset) return;
    exportCSV(dataset);
    logExport({ datasetId: dataset.id, datasetName: dataset.name, format: "csv" });
    setStage("export");
  };

  const handleReset = () => {
    setDataset(null);
    setStage("empty");
    setSelected(new Set());
    setCleanResult(null);
    setUndoStack([]);
    setLastAction(null);
  };

  const handleUndo = () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    setUndoStack((s) => s.slice(0, -1));
    setDataset(last);
    setStage("review");
    setCleanResult(null);
    setLastAction("Reverted");
    toast("Reverted last cleaning step");
  };

  const handleSelectAll = () => {
    setSelected(new Set(issues.filter((i) => i.op).map((i) => i.id)));
  };

  const renderCentral = () => {
    if (rail === "history") return <HistoryView />;
    if (rail === "settings") return <SettingsView />;

    if (stage === "empty" || !dataset) {
      return (
        <EmptyDropzone
          onFile={handleFile}
          onSample={() => handleFile(buildSampleFile())}
        />
      );
    }
    if (stage === "inspecting") return <InspectingOverlay />;

    if (stage === "cleaned" && cleanResult) {
      return (
        <div className="space-y-6 p-6">
          <CleanSummary
            before={cleanResult.before}
            after={cleanResult.after}
            cellsEdited={cleanResult.cellsEdited}
            onDismiss={() => setStage("export")}
          />
          <div className="mx-auto max-w-6xl">
            <DatasetTable dataset={dataset} />
          </div>
        </div>
      );
    }

    if (stage === "export") {
      return (
        <div className="space-y-6 p-6">
          <ExportPanel dataset={dataset} />
          <div className="mx-auto max-w-6xl">
            <DatasetTable dataset={dataset} />
          </div>
        </div>
      );
    }

    // review
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between lg:hidden">
          <Sheet open={mobileIssuesOpen} onOpenChange={setMobileIssuesOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <PanelRightOpen className="h-3.5 w-3.5" />
                {t("issues.title")}
                {issues.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">
                    {issues.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[92vw] p-0 sm:w-[380px]">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="flex items-center gap-2 text-[13px]">
                  <SheetIcon className="h-4 w-4" /> {t("issues.title")}
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100dvh-56px)]">
                <InspectionPanel
                  issues={issues}
                  selected={selected}
                  onToggle={toggleIssue}
                  onSelectAll={handleSelectAll}
                  onClear={() => setSelected(new Set())}
                />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {selected.size} {t("issues.selected")}
          </span>
        </div>
        <DatasetTable dataset={dataset} />
      </div>
    );
  };

  const showRightPanel = rail === "workspace" && stage === "review" && dataset;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <TopBar
        dataset={rail === "workspace" ? dataset : null}
        selectedCount={selected.size}
        onClean={runClean}
        onDownload={handleDownload}
        onReset={handleReset}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
        cleaning={cleaning}
      />
      <div className="flex min-h-0 flex-1">
        <IconRail active={rail} onChange={setRail} />
        <main className="flex min-w-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-auto">{renderCentral()}</div>
          {showRightPanel && (
            <InspectionPanel
              issues={issues}
              selected={selected}
              onToggle={toggleIssue}
              onSelectAll={handleSelectAll}
              onClear={() => setSelected(new Set())}
            />
          )}
        </main>
      </div>
      <StatusBar dataset={rail === "workspace" ? dataset : null} lastAction={lastAction} />
    </div>
  );
}
