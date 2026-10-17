import { useMemo, useState } from "react";
import { CopyX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Dataset, Operation } from "@/lib/cleanlab/types";
import { rowKey } from "@/lib/cleanlab/operations";

interface Props {
  dataset: Dataset;
  onApply: (op: Operation) => void;
}

const MAX_GROUPS = 6;

export function DuplicateReview({ dataset, onApply }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, number[]>();
    dataset.rows.forEach((r, i) => {
      const k = rowKey(r);
      map.set(k, [...(map.get(k) ?? []), i]);
    });
    return [...map.values()].filter((g) => g.length > 1);
  }, [dataset]);

  // Per-group set of row indices marked for deletion. Missing entry = default (all but first).
  const [marked, setMarked] = useState<Map<number, Set<number>>>(new Map());

  const isMarked = (g: number, idx: number, first: number) =>
    marked.has(g) ? marked.get(g)!.has(idx) : idx !== first;

  const toggle = (g: number, idx: number, first: number) => {
    setMarked((prev) => {
      const next = new Map(prev);
      const cur = new Set(prev.has(g) ? prev.get(g)! : groups[g].filter((i) => i !== first));
      if (cur.has(idx)) cur.delete(idx);
      else cur.add(idx);
      next.set(g, cur);
      return next;
    });
  };

  const toDelete = useMemo(
    () => groups.flatMap((g, gi) => g.filter((idx) => isMarked(gi, idx, g[0]))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups, marked],
  );

  if (groups.length === 0) return null;

  const shown = groups.slice(0, MAX_GROUPS);
  const previewCols = dataset.columns.slice(0, 4).map((c) => c.name);

  return (
    <section className="rounded-xl border border-border/70 bg-card p-4 shadow-soft">
      <header className="mb-1 flex items-center gap-2">
        <CopyX className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          Duplicate rows — keep or delete
        </h3>
        <span className="text-[11px] text-muted-foreground">
          ({groups.length} group{groups.length === 1 ? "" : "s"})
        </span>
      </header>
      <p className="mb-3 text-[12.5px] text-muted-foreground">
        Each group is identical rows. Uncheck a row to keep it, check it to delete it. By default every row after the first is marked for deletion.
      </p>

      <div className="space-y-3">
        {shown.map((g, gi) => (
          <div key={gi} className="rounded-lg border border-border/60">
            <p className="border-b border-border/60 bg-muted/30 px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground">
              Group {gi + 1} — {g.length} identical rows (rows {g.map((i) => i + 1).join(", ")})
            </p>
            <ul className="divide-y divide-border/50">
              {g.map((idx) => {
                const del = isMarked(gi, idx, g[0]);
                return (
                  <li key={idx} className="flex items-center gap-3 px-3 py-1.5">
                    <Checkbox
                      checked={del}
                      onCheckedChange={() => toggle(gi, idx, g[0])}
                      aria-label={del ? "Keep this row" : "Delete this row"}
                    />
                    <span className="w-14 shrink-0 text-[11px] text-muted-foreground">Row {idx + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-muted-foreground">
                      {previewCols.map((c) => String(dataset.rows[idx]?.[c] ?? "—")).join(" · ")}
                      {dataset.columns.length > previewCols.length ? " · …" : ""}
                    </span>
                    <span className={del ? "text-[11px] font-medium text-destructive" : "text-[11px] font-medium text-primary"}>
                      {del ? "Delete" : "Keep"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {groups.length > MAX_GROUPS && (
          <p className="text-[11.5px] text-muted-foreground">
            …and {groups.length - MAX_GROUPS} more group{groups.length - MAX_GROUPS === 1 ? "" : "s"} with the same default (keep first, delete the rest).
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-muted-foreground">
          {toDelete.length} row{toDelete.length === 1 ? "" : "s"} will be deleted across all groups.
        </p>
        <Button
          size="sm"
          className="h-8 text-[12.5px]"
          disabled={toDelete.length === 0}
          onClick={() => onApply({ kind: "delete_rows", indices: toDelete })}
        >
          Delete selected ({toDelete.length})
        </Button>
      </div>
    </section>
  );
}
