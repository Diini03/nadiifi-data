import { useMemo, useState } from "react";
import { ArrowRight, Check, PaintBucket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CellValue, Dataset, Operation } from "@/lib/cleanlab/types";
import { isNullish } from "@/lib/cleanlab/infer";
import { formatNumber } from "@/lib/format";

type Strategy = "median" | "mean" | "mode" | "constant" | "skip";

function fillValue(ds: Dataset, column: string, s: Strategy, constant: string): CellValue {
  const col = ds.columns.find((c) => c.name === column);
  if (!col) return null;
  if (s === "mean") return col.stats.mean !== undefined ? Number(col.stats.mean.toFixed(2)) : null;
  if (s === "median") return col.stats.median ?? null;
  if (s === "mode") return col.stats.mode ?? null;
  if (s === "constant") return constant;
  return null;
}

export function fillConfidence(ds: Dataset, column: string, s: Strategy): { score: number; reason: string } {
  const col = ds.columns.find((c) => c.name === column);
  if (!col) return { score: 0, reason: "" };
  const st = col.stats;
  const gapPenalty = Math.min(50, st.missingPct * 1.2);
  let base = 70;
  let reason = "";
  if (s === "constant") return { score: 50, reason: "Your own value — reliability depends on what you know about the data." };
  if (s === "median" || s === "mean") {
    const spread = st.mean && st.std ? Math.abs(st.std / st.mean) : 1;
    const skew = st.mean !== undefined && st.median !== undefined && st.std ? Math.abs(st.mean - st.median) / st.std : 0;
    base = 95 - Math.min(35, spread * 30) - (s === "mean" ? Math.min(20, skew * 60) : 0) - Math.min(10, (st.outliersIQR ?? 0) / Math.max(1, ds.rows.length) * 100);
    reason = spread < 0.3 ? "Values are tightly clustered, so the fill is close to most real values." : "Values vary a lot, so the fill may be far from the true value.";
    if (s === "mean" && skew > 0.2) reason += " Skewed data pulls the average — the middle value is safer.";
  } else {
    const filled = ds.rows.length - st.missing || 1;
    const share = (st.top[0]?.count ?? 0) / filled;
    base = 30 + share * 65;
    reason = `The most common value covers ${Math.round(share * 100)}% of filled cells.`;
  }
  if (st.missingPct > 20) reason += ` ${st.missingPct.toFixed(0)}% of the column is blank, which lowers trust.`;
  return { score: Math.max(5, Math.min(99, Math.round(base - gapPenalty))), reason };
}

export function BlankFillReview({ dataset, onApply }: { dataset: Dataset; onApply: (op: Operation) => void }) {
  const cols = useMemo(
    () => dataset.columns.filter((c) => c.stats.missing > 0 && c.stats.missingPct < 100),
    [dataset],
  );
  const [choice, setChoice] = useState<Record<string, Strategy>>({});
  const [constants, setConstants] = useState<Record<string, string>>({});

  if (cols.length === 0) return null;

  const firstOther = (column: string) =>
    dataset.columns.find((c) => c.name !== column && c.stats.missing < dataset.rows.length)?.name;

  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary">
          <PaintBucket className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-[15px] font-semibold">Review blank cells</h3>
          <p className="text-[13px] text-muted-foreground">
            Blanks are never filled automatically. Pick how to fill each column, check the preview, then approve.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {cols.map((col) => {
          const numeric = col.type === "integer" || col.type === "float";
          const s: Strategy = choice[col.name] ?? (numeric ? "median" : "mode");
          const value = fillValue(dataset, col.name, s, constants[col.name] ?? "");
          const conf = fillConfidence(dataset, col.name, s);
          const tone = conf.score >= 75 ? "bg-success/15 text-success" : conf.score >= 50 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
          const ctx = firstOther(col.name);
          const sample = dataset.rows.filter((r) => isNullish(r[col.name])).slice(0, 3);
          return (
            <div key={col.name} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[13px] font-medium">{col.name}</span>
                <span className="text-[12px] text-muted-foreground">
                  {col.stats.missing} blank ({col.stats.missingPct.toFixed(1)}%)
                </span>
                <span title={conf.reason} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`} aria-label={`Confidence ${conf.score}%`}>
                  {conf.score}% confidence
                </span>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Select value={s} onValueChange={(v) => setChoice((c) => ({ ...c, [col.name]: v as Strategy }))}>
                    <SelectTrigger className="h-8 w-[170px] text-[13px]" aria-label={`Fill method for ${col.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {numeric && <SelectItem value="median">Middle value (median)</SelectItem>}
                      {numeric && <SelectItem value="mean">Average (mean)</SelectItem>}
                      <SelectItem value="mode">Most common value</SelectItem>
                      <SelectItem value="constant">Custom value…</SelectItem>
                    </SelectContent>
                  </Select>
                  {s === "constant" && (
                    <Input
                      className="h-8 w-[140px] text-[13px]"
                      placeholder="e.g. Unknown"
                      value={constants[col.name] ?? ""}
                      onChange={(e) => setConstants((c) => ({ ...c, [col.name]: e.target.value }))}
                    />
                  )}
                  <Button
                    size="sm"
                    className="h-8 text-[13px]"
                    disabled={value === null || value === ""}
                    onClick={() =>
                      onApply(
                        s === "constant"
                          ? { kind: "fill_null", column: col.name, strategy: "constant", value }
                          : { kind: "fill_null", column: col.name, strategy: s as "median" | "mean" | "mode", value },
                      )
                    }
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve fill
                  </Button>
                </div>
              </div>

              <p className="mt-2 text-[12px] text-muted-foreground">{conf.reason}</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="text-muted-foreground">
                    <tr className="text-left">
                      {ctx && <th className="py-1 pr-3 font-medium">{ctx}</th>}
                      <th className="py-1 pr-3 font-medium">Before</th>
                      <th className="py-1 pr-3" />
                      <th className="py-1 font-medium">After</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {sample.map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {ctx && <td className="py-1.5 pr-3 text-muted-foreground">{String(r[ctx] ?? "")}</td>}
                        <td className="py-1.5 pr-3 italic text-destructive">blank</td>
                        <td className="py-1.5 pr-3"><ArrowRight className="h-3 w-3 text-muted-foreground" /></td>
                        <td className="py-1.5 font-semibold">
                          {value === null || value === "" ? "—" : typeof value === "number" ? formatNumber(value) : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {col.stats.missing > sample.length && (
                  <p className="mt-1 text-[11px] text-muted-foreground">+ {col.stats.missing - sample.length} more rows get the same value</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
