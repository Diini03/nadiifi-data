import { useState } from "react";
import { Table2, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CellValue } from "@/lib/cleanlab/types";

interface Props {
  onBuild: (name: string, rows: Record<string, CellValue>[]) => void;
}

const empty = (n: number) => Array.from({ length: n }, () => "");

function toCell(raw: string): CellValue {
  const s = raw.trim();
  if (!s) return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

export function DatasetBuilder({ onBuild }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("My dataset");
  const [cols, setCols] = useState<string[]>(["Name", "Amount", "Date"]);
  const [rows, setRows] = useState<string[][]>([empty(3), empty(3), empty(3)]);

  const setCell = (r: number, c: number, v: string) =>
    setRows((prev) => prev.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? v : cell)) : row)));

  const addColumn = () => {
    setCols((c) => [...c, `Column ${c.length + 1}`]);
    setRows((prev) => prev.map((r) => [...r, ""]));
  };

  const removeColumn = (i: number) => {
    if (cols.length <= 1) return;
    setCols((c) => c.filter((_, j) => j !== i));
    setRows((prev) => prev.map((r) => r.filter((_, j) => j !== i)));
  };

  const addRow = () => setRows((prev) => [...prev, empty(cols.length)]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, j) => j !== i));

  const build = () => {
    const names = cols.map((c, i) => c.trim() || `Column ${i + 1}`);
    const built = rows
      .filter((r) => r.some((cell) => cell.trim() !== ""))
      .map((r) => Object.fromEntries(names.map((n, i) => [n, toCell(r[i] ?? "")])) as Record<string, CellValue>);
    if (built.length === 0) return;
    onBuild(name.trim() || "My dataset", built);
    setOpen(false);
  };

  const hasData = rows.some((r) => r.some((c) => c.trim() !== ""));

  return (
    <>
      <Button size="sm" variant="outline" className="h-9 rounded-md text-[13px]" onClick={() => setOpen(true)}>
        <Table2 className="mr-1.5 h-3.5 w-3.5" /> Build a dataset
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Build a dataset by hand</DialogTitle>
            <DialogDescription>
              Type your own columns and rows, then take it through Clean, Analyze and Visualize.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-muted-foreground">Name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 max-w-xs text-[13px]" />
            </div>
            <div className="max-h-[50vh] overflow-auto rounded-md border border-border/70">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    <th className="w-8 border-b border-border/70 bg-muted/40 px-2 py-1" />
                    {cols.map((c, i) => (
                      <th key={i} className="border-b border-l border-border/70 bg-muted/40 px-1 py-1">
                        <div className="flex items-center gap-1">
                          <Input
                            value={c}
                            onChange={(e) => setCols((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                            className="h-7 min-w-24 border-0 bg-transparent px-1 text-[12px] font-semibold shadow-none focus-visible:ring-1"
                          />
                          <button
                            type="button"
                            aria-label="Remove column"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeColumn(i)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="border-b border-l border-border/70 bg-muted/40 px-1">
                      <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0" aria-label="Add column" onClick={addColumn}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, r) => (
                    <tr key={r} className="even:bg-muted/20">
                      <td className="px-1 text-center text-[11px] text-muted-foreground">{r + 1}</td>
                      {row.map((cell, c) => (
                        <td key={c} className="border-l border-border/50 p-0">
                          <Input
                            value={cell}
                            onChange={(e) => setCell(r, c, e.target.value)}
                            className="h-7 min-w-24 rounded-none border-0 bg-transparent px-1.5 text-[12px] shadow-none focus-visible:ring-1"
                          />
                        </td>
                      ))}
                      <td className="border-l border-border/50 px-1 text-center">
                        <button
                          type="button"
                          aria-label="Remove row"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeRow(r)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" size="sm" variant="outline" className="h-7 text-[12px]" onClick={addRow}>
              <Plus className="mr-1 h-3 w-3" /> Add row
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={build} disabled={!hasData}>Use this dataset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
