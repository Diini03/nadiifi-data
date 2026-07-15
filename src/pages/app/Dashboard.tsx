import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDatasetStore } from "@/store/useDatasetStore";
import { StatCard } from "@/components/app/StatCard";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Rows3,
  Columns3,
  Sparkles,
  HardDrive,
  Upload,
  ArrowRight,
  Download,
  Wand2,
  BarChart3,
} from "lucide-react";
import { formatBytes, formatNumber, formatRelative } from "@/lib/format";

export default function Dashboard() {
  const datasets = useDatasetStore((s) => s.datasets);
  const exports = useDatasetStore((s) => s.exports);
  const loadDataset = useDatasetStore((s) => s.loadDataset);

  useEffect(() => {
    document.title = "Dashboard · CleanLab";
  }, []);

  const totalRows = datasets.reduce((s, d) => s + d.rows, 0);
  const totalCols = datasets.reduce((s, d) => s + d.columns, 0);
  const totalSize = datasets.reduce((s, d) => s + d.fileSize, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-8"
    >
      <PageHeader
        title="Dashboard"
        description="Overview of your datasets and cleaning activity."
        actions={
          <Button asChild size="sm" className="h-9 gap-2">
            <Link to="/app/upload">
              <Upload className="h-4 w-4" /> New dataset
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Datasets" value={datasets.length} icon={FileSpreadsheet} tone="primary" />
        <StatCard label="Total rows" value={formatNumber(totalRows)} icon={Rows3} />
        <StatCard label="Total columns" value={formatNumber(totalCols)} icon={Columns3} />
        <StatCard label="Storage" value={formatBytes(totalSize)} icon={HardDrive} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Recent datasets"
          description={datasets.length > 0 ? `${datasets.length} total` : "Nothing yet"}
          padded={false}
          action={
            datasets.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Link to="/app/upload">
                  Add <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )
          }
        >
          {datasets.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileSpreadsheet}
                title="No datasets yet"
                description="Upload your first CSV or Excel file to get an instant quality report."
                action={
                  <Button asChild size="sm" className="gap-2">
                    <Link to="/app/upload">
                      <Upload className="h-4 w-4" /> Upload dataset
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Name
                    </th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Rows
                    </th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Cols
                    </th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Size
                    </th>
                    <th className="px-6 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.slice(0, 8).map((d) => (
                    <tr
                      key={d.id}
                      className="group cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-muted/40"
                      onClick={() => loadDataset(d.id)}
                    >
                      <td className="px-6 py-3">
                        <Link
                          to={`/app/datasets/${d.id}`}
                          className="flex min-w-0 items-center gap-2.5"
                        >
                          <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span
                            className="truncate font-medium text-foreground group-hover:text-primary"
                            title={d.name}
                          >
                            {d.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {formatNumber(d.rows)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {d.columns}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {formatBytes(d.fileSize)}
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-muted-foreground">
                        {formatRelative(d.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Quick actions">
            <div className="space-y-1.5">
              <QuickAction
                to="/app/upload"
                icon={Upload}
                label="Upload a dataset"
                desc="CSV, Excel, JSON"
              />
              <QuickAction
                to={datasets[0] ? `/app/datasets/${datasets[0].id}/cleaning` : "/app/upload"}
                icon={Wand2}
                label="Open cleaning studio"
                desc="Fix issues in one click"
                disabled={!datasets[0]}
              />
              <QuickAction
                to={datasets[0] ? `/app/datasets/${datasets[0].id}/visualize` : "/app/upload"}
                icon={BarChart3}
                label="Auto-visualize"
                desc="Charts from your data"
                disabled={!datasets[0]}
              />
              <QuickAction
                to={datasets[0] ? `/app/datasets/${datasets[0].id}/overview` : "/app/upload"}
                icon={Sparkles}
                label="AI insights"
                desc="Plain-English summary"
                disabled={!datasets[0]}
              />
            </div>
          </SectionCard>

          <SectionCard title="Recent exports">
            {exports.length === 0 ? (
              <EmptyState compact icon={Download} title="No exports yet" description="Downloads appear here." />
            ) : (
              <div className="space-y-2.5">
                {exports.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate" title={e.datasetName}>
                        {e.datasetName}
                      </span>
                      <span className="text-xs uppercase text-muted-foreground">
                        {e.format}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelative(e.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  desc,
  disabled,
}: {
  to: string;
  icon: any;
  label: string;
  desc: string;
  disabled?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-disabled={disabled}
      className={
        "group flex items-center gap-3 rounded-md border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/40 " +
        (disabled ? "pointer-events-none opacity-50" : "")
      }
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary-soft group-hover:text-primary">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
