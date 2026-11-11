import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (file: File) => void;
  onSample: () => void;
}

export function EmptyDropzone({ onFile, onSample }: Props) {
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="relative w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex w-full flex-col items-center rounded-lg border border-dashed border-border-strong bg-card px-5 py-8 text-center transition-colors sm:py-10",
          dragging && "border-primary bg-primary-soft/40",
        )}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
          <UploadCloud className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-lg font-semibold leading-tight text-foreground sm:text-xl">
          Drop your dataset here
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          A fresh start for your spreadsheets.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xlsx,.xls,.json,.ndjson"
            className="sr-only"
            onChange={handlePick}
            aria-label={t("empty.cta")}
          />
          <Button onClick={() => inputRef.current?.click()} className="h-10 gap-2 px-5 font-semibold">
            <FileSpreadsheet className="h-4 w-4" />
            {t("empty.cta")}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-10 gap-2" onClick={onSample}>
            <Sparkles className="h-4 w-4" /> {t("action.sample")}
          </Button>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          CSV · Excel · JSON · TSV
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          No account needed. Your file stays in your browser.
        </div>
      </div>
    </div>
  );
}
