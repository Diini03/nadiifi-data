import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import type { Dataset, Operation } from "@/lib/cleanlab/types";
import { buildCanonicalMap, canonicalGroups } from "@/lib/cleanlab/canonical";
import { isNullish } from "@/lib/cleanlab/infer";

interface Group {
  label: string;
  variants: string[];
}

interface ColumnGroups {
  column: string;
  groups: Group[];
}

/** Low-cardinality text-like columns whose spellings get merged. */
function candidates(ds: Dataset): ColumnGroups[] {
  const out: ColumnGroups[] = [];
  for (const col of ds.columns) {
    if (col.type !== "categorical" && col.type !== "text") continue;
    const values = ds.rows.map((r) => r[col.name]);
    const nonNull = values.filter((v) => !isNullish(v)).length;
    const distinct = new Set(values.filter((v) => !isNullish(v)).map((v) => String(v).trim())).size;
    if (distinct < 2) continue;
    if (col.type === "text" && distinct > 40 && distinct / Math.max(1, nonNull) > 0.1) continue;
    if (distinct > 60) continue;
    const map = buildCanonicalMap(values);
    const groups = canonicalGroups(map);
    const labels = [...new Set(map.values())].sort();
    const merged = new Map(groups.map((g) => [g.label, g.variants]));
    const all: Group[] = labels.map((label) => ({
      label,
      variants: merged.get(label) ?? [label],
    }));
    if (all.length > 0) out.push({ column: col.name, groups: all });
  }
  return out;
}

export function CategoryOverrides({
  dataset,
  onApply,
}: {
  dataset: Dataset;
  onApply: (op: Operation) => void;
}) {
  const cols = useMemo(() => candidates(dataset), [dataset]);
  const [active, setActive] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  if (cols.length === 0) return null;

  const current = cols.find((c) => c.column === active) ?? null;

  const openColumn = (column: string) => {
    const target = cols.find((c) => c.column === column);
    setActive(column);
    setEdits(Object.fromEntries((target?.groups ?? []).map((g) => [g.label, g.label])));
  };

  const apply = () => {
    if (!current) return;
    const mapping: Record<string, string> = {};
    for (const g of current.groups) {
      const next = (edits[g.label] ?? g.label).trim();
      if (!next) continue;
      for (const v of g.variants) if (v !== next) mapping[v] = next;
    }
    if (Object.keys(mapping).length === 0) return;
    onApply({ kind: "map_values", column: current.column, mapping });
    setActive(null);
  };

  const changed =
    current?.groups.some((g) => (edits[g.label] ?? g.label).trim() !== g.label) ?? false;

  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
        <div>
          <div className="text-sm font-medium">Choose your own labels</div>
          <p className="text-xs text-muted-foreground">
            Force an exact spelling — write "USA" instead of "U.S.A" — and every variant follows.
          </p>
        </div>
        {current && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 text-[13px]" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-[13px]" onClick={apply} disabled={!changed}>
              Apply labels
            </Button>
          </div>
        )}
      </div>

      {!current ? (
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {cols.map((c) => (
            <button
              key={c.column}
              onClick={() => openColumn(c.column)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[12px] transition-colors hover:border-primary hover:text-primary"
            >
              <Pencil className="h-3 w-3" />
              {c.column}
              <span className="text-muted-foreground">({c.groups.length})</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {current.groups.map((g) => (
            <div key={g.label} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] text-muted-foreground">
                  {g.variants.map((v) => `"${v}"`).join(" / ")}
                </div>
              </div>
              <Input
                value={edits[g.label] ?? g.label}
                onChange={(e) => setEdits((p) => ({ ...p, [g.label]: e.target.value }))}
                className="h-8 w-44 font-mono text-[13px]"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
