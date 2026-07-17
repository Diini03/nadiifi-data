import { useCallback, useState, type DragEvent, type ChangeEvent } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles } from "lucide-react";
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
    <div className="relative flex h-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dotted-grid opacity-40" />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative z-10 mx-4 flex w-full max-w-xl flex-col items-center rounded-3xl border border-border bg-card/80 p-10 text-center shadow-elevated backdrop-blur transition-colors",
          dragging && "border-primary bg-primary-soft/40",
        )}
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <UploadCloud className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
          {t("empty.title")}
        </h1>
        <p className="mt-2 max-w-sm text-[13px] text-muted-foreground">
          {t("empty.subtitle")}
        </p>

        <label className="mt-6 inline-flex">
          <input
            type="file"
            accept=".csv,.tsv,.txt,.xlsx,.xls"
            className="sr-only"
            onChange={handlePick}
            aria-label={t("empty.cta")}
          />
          <span
            role="button"
            tabIndex={0}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-px hover:bg-primary/90"
          >
            <UploadCloud className="h-4 w-4" />
            {t("empty.cta")}
          </span>
        </label>

        <p className="mt-3 text-[11px] text-muted-foreground">
          {t("empty.dragHere")} · {t("empty.formats")}
        </p>

        <div className="mt-6 flex items-center gap-2 text-[12px] text-muted-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>—</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto gap-1.5 p-0 text-[12px] text-primary"
            onClick={onSample}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("action.sample")}
          </Button>
        </div>
      </div>
    </div>
  );
}
