import { Sparkles, Download, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cleaningScore } from "@/lib/cleanlab/issues";
import type { Dataset } from "@/lib/cleanlab/types";
import { cn } from "@/lib/utils";

interface Props {
  dataset: Dataset | null;
  selectedCount: number;
  onClean: () => void;
  onDownload: () => void;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
  cleaning: boolean;
}

export function TopBar({
  dataset,
  selectedCount,
  onClean,
  onDownload,
  onReset,
  onUndo,
  canUndo,
  cleaning,
}: Props) {
  const { t } = useI18n();
  const score = dataset ? cleaningScore(dataset) : 0;
  const scoreTone =
    score >= 85 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/70 bg-background/85 px-4 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <Logo size={22} withWordmark wordmarkClassName="text-[14px]" />
      </div>
      <div className="mx-2 hidden h-4 w-px bg-border md:block" />
      <div className="min-w-0 flex-1">
        {dataset ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-[13px] font-medium text-foreground" title={dataset.name}>
              {dataset.name}
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card px-2 py-0.5 text-[11px] text-muted-foreground md:inline-flex">
              <span className="tabular-nums">{dataset.rows.length.toLocaleString()}</span>
              <span>{t("status.rows")}</span>
              <span className="text-border">·</span>
              <span className="tabular-nums">{dataset.columns.length}</span>
              <span>{t("status.cols")}</span>
            </span>
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full border border-border/70 bg-card px-2 py-0.5 text-[11px] md:inline-flex",
                scoreTone,
              )}
              aria-label={`${t("status.score")}: ${score}`}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full bg-current")} />
              <span className="tabular-nums">{score}</span>
              <span className="text-muted-foreground">{t("status.score")}</span>
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-muted-foreground">
            {t("app.datasetPlaceholder")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {dataset && (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 rounded-md text-[12px] text-muted-foreground"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 rounded-md text-[12px] text-muted-foreground"
              onClick={onReset}
              aria-label={t("action.reset")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("action.new")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 rounded-md text-[12px]"
              onClick={onDownload}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("action.download")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onClean}
              disabled={selectedCount === 0 || cleaning}
              className="h-8 gap-1.5 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground shadow-glow hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("action.clean")}</span>
              {selectedCount > 0 && (
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 text-[10px] font-semibold tabular-nums">
                  {selectedCount}
                </span>
              )}
            </Button>
          </>
        )}
        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <LanguageSwitch />
        <ThemeToggle />
      </div>
    </header>
  );
}
