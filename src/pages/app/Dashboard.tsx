import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDatasetStore } from "@/store/useDatasetStore";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileSpreadsheet,
  Rows3,
  Columns3,
  AlertTriangle,
  Sparkles,
  HardDrive,
  Upload,
  ArrowRight,
  Download,
  Wand2,
} from "lucide-react";
import { formatBytes, formatNumber, formatRelative } from "@/lib/format";

export default function Dashboard() {
  const datasets = useDatasetStore((s) => s.datasets);
  const exports = useDatasetStore((s) => s.exports);
  const loadDataset = useDatasetStore((s) => s.loadDataset);

  useEffect(() => {
    document.title = "Dashboard · CleanLab AI";
  }, []);

  const totalRows = datasets.reduce((s, d) => s + d.rows, 0);
  const totalCols = datasets.reduce((s, d) => s + d.columns, 0);
  const totalSize = datasets.reduce((s, d) => s + d.fileSize, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your datasets and cleaning activity.
          </p>
        </div>
        <Button asChild className="gap-2 rounded-full shadow-glow">
          <Link to="/app/upload"><Upload className="h-4 w-4" /> New dataset</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Datasets" value={datasets.length} icon={FileSpreadsheet} tone="primary" />
        <StatCard label="Total rows" value={formatNumber(totalRows)} icon={Rows3} tone="default" />
        <StatCard label="Total columns" value={formatNumber(totalCols)} icon={Columns3} tone="default" />
        <StatCard label="Storage used" value={formatBytes(totalSize)} icon={HardDrive} tone="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent datasets</h2>
            {datasets.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/app/upload">Add <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            )}
          </div>
          {datasets.length === 0 ? (
            <EmptyDatasets />
          ) : (
            <div className="space-y-2">
              {datasets.slice(0, 6).map((d) => (
                <Link
                  key={d.id}
                  to={`/app/datasets/${d.id}`}
                  onClick={() => loadDataset(d.id)}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(d.rows)} rows · {d.columns} cols · {formatBytes(d.fileSize)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatRelative(d.updatedAt)}</div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5 shadow-soft">
            <h2 className="mb-4 font-semibold">Quick actions</h2>
            <div className="space-y-2">
              <QuickAction to="/app/upload" icon={Upload} label="Upload a dataset" desc="CSV, Excel, JSON" />
              <QuickAction
                to={datasets[0] ? `/app/datasets/${datasets[0].id}/cleaning` : "/app/upload"}
                icon={Wand2}
                label="Open cleaning studio"
                desc="Fix issues in one click"
              />
              <QuickAction
                to={datasets[0] ? `/app/datasets/${datasets[0].id}/visualize` : "/app/upload"}
                icon={Sparkles}
                label="Auto-visualize"
                desc="Charts from your data"
              />
            </div>
          </Card>

          <Card className="p-5 shadow-soft">
            <h2 className="mb-4 font-semibold">Recent exports</h2>
            {exports.length === 0 ? (
              <div className="rounded-xl border border-dashed py-6 text-center text-xs text-muted-foreground">
                No exports yet
              </div>
            ) : (
              <div className="space-y-2">
                {exports.slice(0, 4).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{e.datasetName}</span>
                      <span className="text-xs text-muted-foreground uppercase">.{e.format}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatRelative(e.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ to, icon: Icon, label, desc }: { to: string; icon: any; label: string; desc: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function EmptyDatasets() {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="font-medium">No datasets yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Upload your first CSV or Excel file to get an instant quality report.
      </p>
      <Button asChild className="mt-4 gap-2 rounded-full">
        <Link to="/app/upload"><Upload className="h-4 w-4" /> Upload dataset</Link>
      </Button>
    </div>
  );
}
