import { useEffect, useState } from "react";
import { Cloud, Trash2, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  listSavedDatasets,
  loadSavedDataset,
  deleteSavedDataset,
  type SavedDatasetRow,
} from "@/lib/cloud/datasets";
import type { Dataset } from "@/lib/cleanlab/types";
import { formatBytes } from "@/lib/format";

interface Props {
  currentId?: string | null;
  onOpen: (ds: Dataset) => void;
  refreshToken?: number;
}

export function CloudLibrary({ currentId, onOpen, refreshToken }: Props) {
  const [rows, setRows] = useState<SavedDatasetRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const list = await listSavedDatasets();
      setRows(list);
    } catch (err) {
      console.error(err);
      setRows([]);
    }
  };

  useEffect(() => {
    refresh();
  }, [refreshToken]);

  if (rows === null) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-[12.5px] text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading your saved datasets…
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <section className="rounded-xl border border-border/70 bg-card p-4 shadow-soft">
      <header className="mb-3 flex items-center gap-2">
        <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your saved datasets
        </h3>
        <span className="text-[11px] text-muted-foreground">({rows.length})</span>
      </header>
      <ul className="divide-y divide-border/60">
        {rows.map((r) => {
          const isCurrent = r.id === currentId;
          return (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <button
                type="button"
                className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={async () => {
                  setBusy(r.id);
                  try {
                    const ds = await loadSavedDataset(r.id);
                    if (!ds) throw new Error("Not found");
                    onOpen(ds);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to open");
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground group-hover:text-primary">
                    {r.name} {isCurrent && <span className="text-[11px] text-primary">· open</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.row_count.toLocaleString()} rows · {r.column_count} cols ·{" "}
                    {formatBytes(r.file_size)}
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                aria-label="Delete"
                disabled={busy === r.id}
                onClick={async () => {
                  if (!confirm(`Delete "${r.name}"?`)) return;
                  setBusy(r.id);
                  try {
                    await deleteSavedDataset(r.id);
                    setRows((prev) => prev?.filter((x) => x.id !== r.id) ?? null);
                    toast.success("Deleted");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Delete failed");
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                {busy === r.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
