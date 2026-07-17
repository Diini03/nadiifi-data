import { CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Dataset } from "@/lib/cleanlab/types";
import { cleaningScore } from "@/lib/cleanlab/issues";

interface Props {
  before: Dataset;
  after: Dataset;
  cellsEdited: number;
  onDismiss: () => void;
}

export function CleanSummary({ before, after, cellsEdited, onDismiss }: Props) {
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

      <div className="mt-6 flex justify-end">
        <Button onClick={onDismiss} className="h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          {t("clean.dismiss")}
        </Button>
      </div>
    </section>
  );
}
