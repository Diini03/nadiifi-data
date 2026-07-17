import { cleaningScore } from "@/lib/cleanlab/issues";
import type { Dataset } from "@/lib/cleanlab/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface Props {
  dataset: Dataset | null;
  lastAction: string | null;
}

export function StatusBar({ dataset, lastAction }: Props) {
  const { t } = useI18n();
  const score = dataset ? cleaningScore(dataset) : 0;
  const tone =
    score >= 85 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive";

  return (
    <footer className="flex h-8 items-center gap-4 border-t border-border/70 bg-sidebar/40 px-4 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", dataset ? "bg-success" : "bg-muted-foreground/50")} />
        {dataset ? t("status.ready") : t("app.datasetPlaceholder")}
      </span>
      {dataset && (
        <>
          <span className="text-border">·</span>
          <span className="tabular-nums">
            {dataset.rows.length.toLocaleString()} {t("status.rows")}
          </span>
          <span className="text-border">·</span>
          <span className="tabular-nums">
            {dataset.columns.length} {t("status.cols")}
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", tone)} />
            <span className="tabular-nums">{score}</span>
            <span>{t("status.score")}</span>
          </span>
        </>
      )}
      <div className="ml-auto min-w-0 truncate">
        {lastAction && (
          <span>
            {t("status.lastAction")}: <span className="text-foreground">{lastAction}</span>
          </span>
        )}
      </div>
    </footer>
  );
}
