import type { Dataset } from "@/lib/cleanlab/types";
import { StatCard } from "@/components/app/StatCard";
import { cleaningScore } from "@/lib/cleanlab/issues";
import { Rows3, Columns3, CircleSlash, Copy, Gauge, HardDrive } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function KpiStrip({ dataset }: { dataset: Dataset }) {
  const { t } = useI18n();
  const totalCells = dataset.rows.length * dataset.columns.length || 1;
  const missing = dataset.columns.reduce((s, c) => s + c.stats.missing, 0);
  const missingPct = ((missing / totalCells) * 100).toFixed(1);

  const seen = new Map<string, number>();
  for (const r of dataset.rows) {
    const k = JSON.stringify(r);
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  const dup = [...seen.values()].reduce((s, c) => s + (c > 1 ? c - 1 : 0), 0);

  const score = cleaningScore(dataset);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatCard label={t("kpi.rows")} value={dataset.rows.length.toLocaleString()} icon={Rows3} />
      <StatCard label={t("kpi.columns")} value={dataset.columns.length} icon={Columns3} />
      <StatCard
        label={t("kpi.missing")}
        value={missing.toLocaleString()}
        hint={`${missingPct}%`}
        icon={CircleSlash}
        tone={missing > 0 ? "warning" : "default"}
      />
      <StatCard
        label={t("kpi.duplicates")}
        value={dup.toLocaleString()}
        icon={Copy}
        tone={dup > 0 ? "warning" : "default"}
      />
      <StatCard
        label={t("kpi.quality")}
        value={`${score}`}
        hint="0–100"
        icon={Gauge}
        tone={score >= 85 ? "success" : score >= 60 ? "warning" : "default"}
      />
      <StatCard label={t("kpi.memory")} value={formatBytes(dataset.fileSize)} icon={HardDrive} />
    </div>
  );
}
