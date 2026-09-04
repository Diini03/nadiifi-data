import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Dataset } from "@/lib/cleanlab/types";
import { classifyDataset, ROLE_LABEL, roleTone } from "@/lib/cleanlab/semantics";
import { confidenceLabel } from "@/lib/cleanlab/recommend";

export function ColumnIntelligence({ dataset }: { dataset: Dataset }) {
  const columns = useMemo(() => classifyDataset(dataset), [dataset]);

  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="border-b border-border/70 px-4 py-3">
        <div className="text-sm font-medium">Column understanding</div>
        <p className="text-xs text-muted-foreground">
          What each column <em>means</em>, not just how it is stored. Identifiers are kept out of totals and charts.
        </p>
      </div>
      <div className="divide-y divide-border/70">
        {columns.map((c) => {
          const conf = confidenceLabel(c.confidence);
          return (
            <div key={c.name} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[13px] font-medium">{c.name}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", roleTone(c.role))}>
                  {ROLE_LABEL[c.role]}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  stored as {c.rawType}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", conf.tone)}>{conf.label}</span>
                {c.confidence < 0.7 && (
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                    needs review
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{c.reason}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span>{c.cardinality.toLocaleString()} distinct</span>
                <span>{Math.round(c.uniquePct * 100)}% unique</span>
                <span>{c.missingPct.toFixed(1)}% missing</span>
                {c.examples.length > 0 && (
                  <span className="truncate">e.g. {c.examples.slice(0, 3).map(String).join(", ")}</span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {c.recommendedUses.slice(0, 3).map((u) => (
                  <span key={u} className="rounded border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] text-success">
                    good for {u.toLowerCase()}
                  </span>
                ))}
                {c.avoidUses.slice(0, 2).map((u) => (
                  <span key={u} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    avoid {u.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
