import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dataset, Operation } from "@/lib/cleanlab/types";
import { duplicateGroups } from "@/lib/cleanlab/review";

export function DuplicateReview({ dataset, onApply }: { dataset: Dataset; onApply: (op: Operation) => void }) {
  const groups = useMemo(() => duplicateGroups(dataset), [dataset]);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  useEffect(() => { setMarked(new Set()); setPage(0); }, [dataset]);
  if (!groups.length) return null;
  const shown = groups.slice(page * 6, (page + 1) * 6);
  return <section className="space-y-4 border-t border-border pt-5">
    <h3 className="font-display font-semibold">Duplicate rows — keep or delete</h3>
    <p className="text-sm text-muted-foreground">All rows start as Keep. Repeated IDs may be valid line items; compare every column before deleting.</p>
    {shown.map(g => <div key={g.key} className="overflow-hidden rounded-lg border border-border">
      <p className="bg-muted p-3 text-sm">{g.title}{g.indices.every(i => marked.has(i)) && <span className="block text-destructive">Warning: every row in this group is marked for deletion.</span>}</p>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr><th className="p-2">Choice</th><th className="p-2">Row</th>{dataset.columns.map(c => <th key={c.name} className="p-2 text-left">{c.name}</th>)}</tr></thead><tbody>
        {g.indices.map(i => <tr key={i} className={marked.has(i) ? "bg-destructive/10" : "border-t border-border"}>
          <td className="p-2"><div className="flex gap-1">{[false, true].map(del => <Button key={String(del)} size="sm" variant={marked.has(i) === del ? (del ? "destructive" : "default") : "outline"} aria-pressed={marked.has(i) === del} onClick={() => setMarked(prev => { const next = new Set(prev); del ? next.add(i) : next.delete(i); return next; })}>{del ? "Delete" : "Keep"}</Button>)}</div></td><td className="p-2">{i + 1}</td>
          {dataset.columns.map(c => <td key={c.name} className={`whitespace-pre-wrap min-w-28 p-2 font-mono ${new Set(g.indices.map(idx => JSON.stringify(dataset.rows[idx]?.[c.name]))).size > 1 ? "text-warning font-semibold" : ""}`}>{String(dataset.rows[i]?.[c.name] ?? "blank")}</td>)}
        </tr>)}
      </tbody></table></div>
    </div>)}
    <div className="flex flex-wrap justify-between gap-2"><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={!page} onClick={() => setPage(p => p - 1)}>Previous groups</Button><span className="text-xs">{page + 1} / {Math.ceil(groups.length / 6)}</span><Button size="sm" variant="outline" disabled={(page + 1) * 6 >= groups.length} onClick={() => setPage(p => p + 1)}>Next groups</Button></div>
      <Button disabled={!marked.size} onClick={() => onApply({ kind: "delete_rows", indices: [...marked] })}>Delete selected ({marked.size})</Button></div>
  </section>;
}