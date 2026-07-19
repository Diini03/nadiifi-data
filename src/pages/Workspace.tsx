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
import { KpiStrip } from "@/components/workspace/KpiStrip";
import { InsightsView } from "@/components/workspace/InsightsView";
import { ViewHeader } from "@/components/workspace/ViewHeader";
import { CloudLibrary } from "@/components/workspace/CloudLibrary";
import { AutoCharts } from "@/components/charts/AutoCharts";
import { DatasetTable } from "@/components/app/DatasetTable";
import { EmptyState } from "@/components/app/EmptyState";
import { parseFile } from "@/lib/cleanlab/parse";
import { profileDataset } from "@/lib/cleanlab/profile";
import { detectIssues } from "@/lib/cleanlab/issues";
import { applyOperation, operationLabel } from "@/lib/cleanlab/operations";
import type { Dataset, Issue } from "@/lib/cleanlab/types";
import { useDatasetStore } from "@/store/useDatasetStore";
import { exportCSV } from "@/lib/cleanlab/exporters";
import { buildSampleFile } from "@/lib/cleanlab/sample";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { upsertSavedDataset } from "@/lib/cloud/datasets";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon } from "lucide-react";

type Stage = "empty" | "inspecting" | "ready" | "cleaned";

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
  const [rail, setRail] = useState<RailView>("data");
  const [stage, setStage] = useState<Stage>("empty");
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<CleanRecord | null>(null);
  const [undoStack, setUndoStack] = useState<Dataset[]>([]);

  const addDataset = useDatasetStore((s) => s.addDataset);
  const logExport = useDatasetStore((s) => s.logExport);

  const issues: Issue[] = useMemo(() => (dataset ? detectIssues(dataset) : []), [dataset]);

  useEffect(() => {
    if (rail === "clean" && dataset) {
      setSelected(new Set(issues.filter((i) => i.op).map((i) => i.id)));
    }
  }, [rail, dataset, issues]);

  const handleFile = async (file: File) => {
    setStage("inspecting");
    try {
      const rows = await parseFile(file);
      if (!rows || rows.length === 0) {
        toast.error("The file appears to be empty.");
        setStage("empty");
        return;
      }
      await new Promise((r) => setTimeout(r, 350));
      const ds = profileDataset(file.name.replace(/\.[^.]+$/, ""), rows, file.size);
      setDataset(ds);
      setUndoStack([]);
      setLastAction(null);
      setCleanResult(null);
      setStage("ready");
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
  };

  const handleReset = () => {
    setDataset(null);
    setStage("empty");
    setSelected(new Set());
    setCleanResult(null);
    setUndoStack([]);
    setLastAction(null);
    setRail("data");
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

  const handleSelectAll = () => {
    setSelected(new Set(issues.filter((i) => i.op).map((i) => i.id)));
  };

  const needsDataset = (
    <div className="p-6">
      <EmptyState
        icon={UploadIcon}
        title={t("empty.needDataset")}
        description=""
        action={
          <Button size="sm" onClick={() => setRail("data")}>
            {t("action.upload")}
          </Button>
        }
      />
    </div>
  );

  const renderCentral = () => {
    if (rail === "history") return <HistoryView />;
    if (rail === "settings") return <SettingsView />;

    if (stage === "inspecting") return <InspectingOverlay />;

    if (rail === "data") {
      if (!dataset || stage === "empty") {
        return (
          <EmptyDropzone
            onFile={handleFile}
            onSample={() => handleFile(buildSampleFile())}
          />
        );
      }
      return (
        <div className="flex min-h-full flex-col">
          <ViewHeader title={t("view.data.title")} subtitle={t("view.data.subtitle")} />
          <div className="space-y-4 p-6">
            <KpiStrip dataset={dataset} />
            <DatasetTable dataset={dataset} />
          </div>
        </div>
      );
    }

    if (!dataset) return needsDataset;

    if (rail === "clean") {
      if (stage === "cleaned" && cleanResult) {
        return (
          <div className="flex min-h-full flex-col">
            <ViewHeader title={t("view.clean.title")} subtitle={t("view.clean.subtitle")} />
            <div className="space-y-6 p-6">
              <CleanSummary
                before={cleanResult.before}
                after={cleanResult.after}
                cellsEdited={cleanResult.cellsEdited}
                onDismiss={() => setStage("ready")}
              />
              <DatasetTable dataset={dataset} />
            </div>
          </div>
        );
      }
      return (
        <div className="flex min-h-full flex-col">
          <ViewHeader title={t("view.clean.title")} subtitle={t("view.clean.subtitle")} />
          <div className="space-y-4 p-6">
            <KpiStrip dataset={dataset} />
            <DatasetTable dataset={dataset} />
          </div>
        </div>
      );
    }

    if (rail === "analyze") {
      return (
        <div className="flex min-h-full flex-col">
          <ViewHeader title={t("view.analyze.title")} subtitle={t("view.analyze.subtitle")} />
          <div className="space-y-4 p-6">
            <KpiStrip dataset={dataset} />
            <AutoCharts dataset={dataset} />
          </div>
        </div>
      );
    }

    if (rail === "dashboard") {
      return (
        <div className="flex min-h-full flex-col">
          <ViewHeader title={t("view.dashboard.title")} subtitle={t("view.dashboard.subtitle")} />
          <div className="space-y-4 p-6">
            <KpiStrip dataset={dataset} />
            <AutoCharts dataset={dataset} />
          </div>
        </div>
      );
    }

    if (rail === "insights") {
      return (
        <div className="flex min-h-full flex-col">
          <ViewHeader title={t("view.insights.title")} subtitle={t("view.insights.subtitle")} />
          <div className="p-6">
            <InsightsView dataset={dataset} />
          </div>
        </div>
      );
    }

    if (rail === "export") {
      return (
        <div className="flex min-h-full flex-col">
          <ViewHeader title={t("view.export.title")} subtitle={t("view.export.subtitle")} />
          <div className="space-y-6 p-6">
            <ExportPanel dataset={dataset} />
            <DatasetTable dataset={dataset} />
          </div>
        </div>
      );
    }

    return null;
  };

  const showRightPanel = rail === "clean" && dataset && stage !== "cleaned";

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <TopBar
        dataset={dataset}
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
      <StatusBar dataset={dataset} lastAction={lastAction} />
    </div>
  );
}
