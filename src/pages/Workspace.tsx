import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Cloud, Loader2, Trash2, FileSpreadsheet } from "lucide-react";
import { Navbar } from "@/components/nadiifi/Navbar";
import { SiteFooter } from "@/components/nadiifi/SiteFooter";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { listSavedDatasets, deleteSavedDataset, type SavedDatasetRow } from "@/lib/cloud/datasets";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Workspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<SavedDatasetRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    listSavedDatasets()
      .then(setRows)
      .catch((err) => {
        console.error(err);
        setRows([]);
      });
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Your workspace</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Datasets saved to your account{user?.email ? ` (${user.email})` : ""}. Open one to keep cleaning
            where you left off.
          </p>
        </header>

        {rows === null ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-6 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your saved datasets…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <Cloud className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-[14px] font-medium">No saved datasets yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Upload a file on the home page and it will be saved here automatically.
            </p>
            <Button className="mt-5" onClick={() => navigate("/")}>
              Upload a dataset
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card px-4 shadow-soft">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <button
                  type="button"
                  className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => navigate(`/?open=${r.id}`)}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                    <FileSpreadsheet className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium group-hover:text-primary">{r.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {r.row_count.toLocaleString()} rows · {r.column_count} columns · {formatBytes(r.file_size)} ·
                      updated {new Date(r.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${r.name}`}
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
                  {busy === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
