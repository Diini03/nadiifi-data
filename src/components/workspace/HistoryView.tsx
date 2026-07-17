import { useDatasetStore } from "@/store/useDatasetStore";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { History as HistoryIcon } from "lucide-react";

export function HistoryView() {
  const { t } = useI18n();
  const history = useDatasetStore((s) => s.history);
  const exports = useDatasetStore((s) => s.exports);

  const items = [
    ...history.map((h) => ({
      id: h.id,
      title: h.label,
      when: h.timestamp,
      meta: `${h.rowsBefore.toLocaleString()} → ${h.rowsAfter.toLocaleString()} rows`,
    })),
    ...exports.map((e) => ({
      id: e.id,
      title: `Exported ${e.datasetName} as ${e.format.toUpperCase()}`,
      when: e.timestamp,
      meta: "",
    })),
  ].sort((a, b) => b.when - a.when);

  return (
    <section className="mx-auto w-full max-w-3xl py-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <HistoryIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl leading-tight text-foreground">
            {t("history.title")}
          </h2>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-10 text-center text-[13px] text-muted-foreground">
          {t("history.empty")}
        </div>
      ) : (
        <ol className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 shadow-soft"
            >
              <div>
                <p className="text-[13px] font-medium text-foreground">{it.title}</p>
                {it.meta && (
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{it.meta}</p>
                )}
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {new Date(it.when).toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
