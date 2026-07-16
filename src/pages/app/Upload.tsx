import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { UploadCloud, FileSpreadsheet, Loader2, Check, X, ShieldCheck, Zap, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/app/PageHeader";
import { parseFile } from "@/lib/cleanlab/parse";
import { profileDataset } from "@/lib/cleanlab/profile";
import { useDatasetStore } from "@/store/useDatasetStore";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_MB = 50;
const ACCEPTED = /\.(csv|tsv|xlsx|xls|txt|json)$/i;

export default function Upload() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "parsing" | "profiling" | "done" | "error">("idle");
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[] } | null>(null);
  const navigate = useNavigate();
  const addDataset = useDatasetStore((s) => s.addDataset);

  useEffect(() => {
    document.title = "Upload · NadiifiData";
  }, []);

  const validate = (f: File): string | null => {
    if (!ACCEPTED.test(f.name)) {
      return "Unsupported format. Try CSV, TSV, Excel, or JSON.";
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      return `File is larger than ${MAX_MB} MB. Split the file and try again.`;
    }
    return null;
  };

  const handleFile = useCallback(
    async (f: File) => {
      const err = validate(f);
      if (err) {
        toast.error("Can't read this file", { description: err });
        return;
      }
      setFile(f);
      setPreview(null);
      setStatus("parsing");
      setProgress(15);
      try {
        const rows = await parseFile(f);
        setProgress(60);
        if (rows.length === 0) {
          toast.error("This file appears to be empty.");
          setStatus("error");
          return;
        }
        setStatus("profiling");
        const headers = Object.keys(rows[0]);
        setPreview({ headers, rows: rows.slice(0, 20) });
        setProgress(80);
        await new Promise((r) => setTimeout(r, 60));
        const ds = profileDataset(f.name.replace(/\.[^.]+$/, ""), rows, f.size);
        setProgress(100);
        await addDataset(ds);
        setStatus("done");
        toast.success("Dataset ready", {
          description: `Loaded ${rows.length.toLocaleString()} rows across ${headers.length} columns`,
        });
        setTimeout(() => navigate(`/app/datasets/${ds.id}`), 500);
      } catch (e: any) {
        console.error(e);
        toast.error("We couldn't parse this file", {
          description: e?.message || "Check the format and try again.",
        });
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

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setStatus("idle");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      <PageHeader
        title="Upload dataset"
        description="Drop a CSV or Excel file to profile it instantly. Files never leave your browser."
      />

      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all duration-150",
          dragging
            ? "border-primary bg-primary-soft/60 scale-[1.01]"
            : "border-border bg-card hover:border-border-strong hover:bg-muted/20",
        )}
      >
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all",
            dragging ? "scale-110 bg-primary text-primary-foreground shadow-glow" : "bg-primary-soft text-primary",
          )}
        >
          <UploadCloud className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <h3 className="text-base font-semibold">Drop a file to begin</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          CSV, TSV, Excel, or JSON — up to {MAX_MB} MB
        </p>
        <div className="mt-5">
          <label>
            <input
              type="file"
              className="sr-only"
              accept=".csv,.tsv,.xlsx,.xls,.txt,.json"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Button asChild size="sm" className="h-9 cursor-pointer">
              <span>Choose file</span>
            </Button>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Private — stays local
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-warning" /> Instant profiling
          </span>
          <span className="inline-flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> No signup
          </span>
        </div>
      </Card>

      {file && (
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                status === "done" && "bg-success/10 text-success",
                status === "error" && "bg-destructive/10 text-destructive",
                (status === "parsing" || status === "profiling") && "bg-primary-soft text-primary",
                status === "idle" && "bg-muted text-muted-foreground",
              )}
            >
              {status === "done" ? (
                <Check className="h-4 w-4" />
              ) : status === "error" ? (
                <X className="h-4 w-4" />
              ) : status === "idle" ? (
                <FileSpreadsheet className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-medium" title={file.name}>
                  {file.name}
                </div>
                <div className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatBytes(file.size)}
                </div>
              </div>
              <Progress value={progress} className="mt-2 h-1" />
              <div className="mt-1.5 text-xs text-muted-foreground">
                {status === "idle"
                  ? "Waiting…"
                  : status === "parsing"
                  ? "Parsing rows…"
                  : status === "profiling"
                  ? "Profiling columns…"
                  : status === "done"
                  ? "Ready — opening dataset…"
                  : "Something went wrong"}
              </div>
            </div>
            {(status === "done" || status === "error") && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={reset} aria-label="Reset">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {preview && (
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Preview · first {preview.rows.length} rows
              </div>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {preview.headers.slice(0, 8).map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                      {preview.headers.length > 8 && (
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">…</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-t border-border/60">
                        {preview.headers.slice(0, 8).map((h) => (
                          <td key={h} className="max-w-[160px] truncate px-3 py-1.5">
                            {r[h] == null ? (
                              <span className="italic text-muted-foreground/60">null</span>
                            ) : (
                              String(r[h])
                            )}
                          </td>
                        ))}
                        {preview.headers.length > 8 && (
                          <td className="px-3 py-1.5 text-muted-foreground">…</td>
                        )}
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
