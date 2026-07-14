import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { UploadCloud, FileSpreadsheet, Loader2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { parseFile } from "@/lib/cleanlab/parse";
import { profileDataset } from "@/lib/cleanlab/profile";
import { useDatasetStore } from "@/store/useDatasetStore";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Upload() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "parsing" | "profiling" | "done" | "error">("idle");
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[] } | null>(null);
  const navigate = useNavigate();
  const addDataset = useDatasetStore((s) => s.addDataset);

  useEffect(() => {
    document.title = "Upload · CleanLab AI";
  }, []);

  const handleFile = useCallback(
    async (f: File) => {
      setFile(f);
      setStatus("parsing");
      setProgress(15);
      try {
        const rows = await parseFile(f);
        setProgress(60);
        if (rows.length === 0) {
          toast.error("The file appears to be empty.");
          setStatus("error");
          return;
        }
        setStatus("profiling");
        const headers = Object.keys(rows[0]);
        setPreview({ headers, rows: rows.slice(0, 20) });
        setProgress(80);
        // yield to UI
        await new Promise((r) => setTimeout(r, 60));
        const ds = profileDataset(f.name.replace(/\.[^.]+$/, ""), rows, f.size);
        setProgress(100);
        await addDataset(ds);
        setStatus("done");
        toast.success(`Loaded ${rows.length.toLocaleString()} rows`);
        setTimeout(() => navigate(`/app/datasets/${ds.id}`), 500);
      } catch (e: any) {
        console.error(e);
        toast.error("Could not parse file", { description: e?.message });
        setStatus("error");
      }
    },
    [addDataset, navigate],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload dataset</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop a CSV or Excel file to profile it instantly. Files never leave your browser.
        </p>
      </div>

      <Card
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-14 text-center transition-all",
          dragging ? "border-primary bg-primary-soft" : "border-border bg-card",
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold">Drop a file to begin</h3>
        <p className="mt-1 text-sm text-muted-foreground">CSV, TSV, or Excel · up to ~50 MB</p>
        <div className="mt-6">
          <label>
            <input
              type="file"
              className="sr-only"
              accept=".csv,.tsv,.xlsx,.xls,.txt"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Button asChild className="cursor-pointer rounded-full">
              <span>Choose file</span>
            </Button>
          </label>
        </div>
      </Card>

      {file && (
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {status === "done" ? <Check className="h-5 w-5" /> : status === "error" ? <FileSpreadsheet className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="truncate font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
              </div>
              <Progress value={progress} className="mt-2 h-1.5" />
              <div className="mt-1.5 text-xs text-muted-foreground capitalize">
                {status === "idle" ? "Waiting…" :
                 status === "parsing" ? "Parsing rows…" :
                 status === "profiling" ? "Profiling columns…" :
                 status === "done" ? "Ready — redirecting…" :
                 "Something went wrong"}
              </div>
            </div>
          </div>

          {preview && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Preview · first {preview.rows.length} rows
              </div>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {preview.headers.slice(0, 8).map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium">{h}</th>
                      ))}
                      {preview.headers.length > 8 && <th className="px-3 py-2 text-left font-medium">…</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-t">
                        {preview.headers.slice(0, 8).map((h) => (
                          <td key={h} className="max-w-[160px] truncate px-3 py-1.5">
                            {r[h] == null ? <span className="italic text-muted-foreground/60">null</span> : String(r[h])}
                          </td>
                        ))}
                        {preview.headers.length > 8 && <td className="px-3 py-1.5 text-muted-foreground">…</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </motion.div>
  );
}
