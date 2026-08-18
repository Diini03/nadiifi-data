import { CheckCircle2, TrendingUp, TrendingDown, Minus, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Dataset } from "@/lib/cleanlab/types";
import { cleaningScore } from "@/lib/cleanlab/issues";

interface Props {
  before: Dataset;
  after: Dataset;
  cellsEdited: number;
  onDismiss: () => void;
  onVisualize?: () => void;
}


export function CleanSummary({ before, after, cellsEdited, onDismiss, onVisualize }: Props) {
  const { t } = useI18n();
  const scoreBefore = cleaningScore(before);
  const scoreAfter = cleaningScore(after);
  const delta = scoreAfter - scoreBefore;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  const stats = [
    {
      label: t("clean.rowsBefore"),
      value: before.rows.length.toLocaleString(),
    },
    {
      label: t("clean.rowsAfter"),
      value: after.rows.length.toLocaleString(),
    },
    {
      label: t("clean.cellsEdited"),
      value: cellsEdited.toLocaleString(),
    },
    {
      label: t("clean.qualityDelta"),
      value: `${delta > 0 ? "+" : ""}${delta}`,
      icon: TrendIcon,
      tone: delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-2xl animate-fade-up rounded-3xl border border-border bg-card p-7 shadow-elevated">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-2xl leading-tight text-foreground">
            {t("clean.title")}
          </h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">{t("clean.subtitle")}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => {
          const Icon = "icon" in s ? s.icon : undefined;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-border/70 bg-background p-3"
            >
              <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div
                className={`mt-1 flex items-center gap-1 text-lg font-semibold tabular-nums ${
                  "tone" in s ? s.tone : "text-foreground"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {onVisualize && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft/40 p-3">
          <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-[12.5px] text-foreground">
            Next step: open <span className="font-semibold">Visualize</span> to chart your clean data.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onDismiss} className="h-9 rounded-lg">
          {t("clean.dismiss")}
        </Button>
        {onVisualize && (
          <Button onClick={onVisualize} className="h-9 rounded-lg shadow-glow">
            Visualize data <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </div>

    </section>
  );
}
