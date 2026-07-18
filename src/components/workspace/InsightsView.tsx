import { useMemo } from "react";
import type { Dataset } from "@/lib/cleanlab/types";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/app/EmptyState";
import { Lightbulb, TrendingUp, PieChart, AlertTriangle, CircleSlash, MinusCircle } from "lucide-react";
import { coerceNumber } from "@/lib/cleanlab/infer";
import { useI18n } from "@/lib/i18n/LanguageProvider";

interface Insight {
  icon: typeof Lightbulb;
  title: string;
  body: string;
  tone: "info" | "warning" | "success";
}

function pearson(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  if (n < 3) return 0;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}

export function InsightsView({ dataset }: { dataset: Dataset | null }) {
  const { t } = useI18n();
  const insights = useMemo<Insight[]>(() => {
    if (!dataset) return [];
    const out: Insight[] = [];
    const numeric = dataset.columns.filter((c) => c.type === "integer" || c.type === "float");
    const cat = dataset.columns.filter((c) => c.type === "categorical" || c.type === "boolean");

    // correlations
    if (numeric.length >= 2) {
      const arrays = numeric.map((c) =>
        dataset.rows.map((r) => coerceNumber(r[c.name])).filter((v): v is number => v !== null),
      );
      const minLen = Math.min(...arrays.map((a) => a.length));
      let best = { i: -1, j: -1, r: 0 };
      for (let i = 0; i < numeric.length; i++) {
        for (let j = i + 1; j < numeric.length; j++) {
          const r = pearson(arrays[i].slice(0, minLen), arrays[j].slice(0, minLen));
          if (Math.abs(r) > Math.abs(best.r)) best = { i, j, r };
        }
      }
      if (Math.abs(best.r) >= 0.5) {
        out.push({
          icon: TrendingUp,
          tone: "info",
          title: t("insights.correlation"),
          body: `${numeric[best.i].name} and ${numeric[best.j].name} have a ${best.r >= 0 ? "positive" : "negative"} correlation of ${best.r.toFixed(2)}.`,
        });
      }
    }

    // dominant category
    for (const c of cat.slice(0, 3)) {
      const top = c.stats.top[0];
      if (!top) continue;
      const share = top.count / dataset.rows.length;
      if (share >= 0.6) {
        out.push({
          icon: PieChart,
          tone: "info",
          title: t("insights.topCategory"),
          body: `"${String(top.value)}" makes up ${(share * 100).toFixed(0)}% of ${c.name}.`,
        });
      } else if (share > 0 && share <= 0.25 && c.stats.unique >= 4) {
        out.push({
          icon: PieChart,
          tone: "success",
          title: t("insights.balanced"),
          body: `${c.name} is well-distributed across ${c.stats.unique} categories.`,
        });
      }
    }

    // outliers
    for (const c of numeric) {
      const n = c.stats.outliersIQR ?? 0;
      if (n > 0) {
        out.push({
          icon: AlertTriangle,
          tone: "warning",
          title: t("insights.outliers"),
          body: `${n} outlier${n === 1 ? "" : "s"} detected in ${c.name} (IQR method).`,
        });
      }
    }

    // high missing
    for (const c of dataset.columns) {
      if (c.stats.missingPct >= 20) {
        out.push({
          icon: CircleSlash,
          tone: "warning",
          title: t("insights.missingImpact"),
          body: `${c.name} is missing in ${c.stats.missingPct.toFixed(0)}% of rows.`,
        });
      }
    }

    // constant
    for (const c of dataset.columns) {
      if (c.stats.unique <= 1 && dataset.rows.length > 1) {
        out.push({
          icon: MinusCircle,
          tone: "info",
          title: t("insights.constant"),
          body: `${c.name} has only one unique value — consider dropping it.`,
        });
      }
    }

    return out;
  }, [dataset, t]);

  if (!dataset) {
    return <EmptyState icon={Lightbulb} title={t("insights.empty")} description="" />;
  }
  if (insights.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="Nothing unusual yet"
        description="As your dataset grows, notable patterns will appear here."
      />
    );
  }

  const toneClass = {
    info: "bg-primary-soft text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((i, idx) => {
        const Icon = i.icon;
        return (
          <Card key={idx} className="flex gap-3 p-4 shadow-soft">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClass[i.tone]}`}>
              <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {i.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-foreground">{i.body}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
