import { AlertOctagon, AlertTriangle, Info, Check } from "lucide-react";
import type { Issue } from "@/lib/cleanlab/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  issues: Issue[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const severityMeta = {
  critical: { icon: AlertOctagon, tone: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, tone: "text-warning", bg: "bg-warning/15" },
  info: { icon: Info, tone: "text-info", bg: "bg-info/10" },
} as const;

export function InspectionPanel({ issues, selected, onToggle, onSelectAll, onClear }: Props) {
  const { t } = useI18n();

  const grouped = {
    critical: issues.filter((i) => i.severity === "critical"),
    warning: issues.filter((i) => i.severity === "warning"),
    info: issues.filter((i) => i.severity === "info"),
  };
  const selectableIds = issues.filter((i) => i.op).map((i) => i.id);

  return (
    <aside
      className="hidden w-[340px] shrink-0 flex-col border-l border-border/70 bg-sidebar/40 lg:flex"
      aria-label="Data quality inspection"
    >
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-foreground">
            {t("issues.title")}
          </span>
          <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
            {issues.length}
          </span>
        </div>
        {issues.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] text-muted-foreground"
              onClick={onSelectAll}
              disabled={selectableIds.length === 0}
            >
              {t("action.selectAll")}
            </Button>
            {selected.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground"
                onClick={onClear}
              >
                {t("action.clearSelection")}
              </Button>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {issues.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-[13px] text-muted-foreground">{t("issues.none")}</p>
          </div>
        ) : (
          <div className="space-y-4 px-3 py-3">
            {(["critical", "warning", "info"] as const).map((sev) => {
              const list = grouped[sev];
              if (list.length === 0) return null;
              return (
                <div key={sev}>
                  <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", {
                        "bg-destructive": sev === "critical",
                        "bg-warning": sev === "warning",
                        "bg-info": sev === "info",
                      })}
                    />
                    {t(`issues.severity.${sev}` as const)}
                    <span className="ml-auto tabular-nums text-muted-foreground/70">
                      {list.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {list.map((issue) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        selected={selected.has(issue.id)}
                        onToggle={() => onToggle(issue.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {selected.size > 0 && (
        <div className="border-t border-border/70 bg-card/60 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="tabular-nums font-medium text-foreground">{selected.size}</span>{" "}
          {t("issues.selected")}
        </div>
      )}
    </aside>
  );
}

function IssueRow({
  issue,
  selected,
  onToggle,
}: {
  issue: Issue;
  selected: boolean;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  const meta = severityMeta[issue.severity];
  const Icon = meta.icon;
  const canSelect = !!issue.op;
  return (
    <button
      type="button"
      onClick={canSelect ? onToggle : undefined}
      aria-pressed={selected}
      disabled={!canSelect}
      className={cn(
        "group w-full rounded-xl border p-3 text-left transition-colors",
        selected
          ? "border-primary/40 bg-primary-soft/60 shadow-soft"
          : "border-border/70 bg-card hover:border-border-strong",
        !canSelect && "opacity-70",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", meta.bg, meta.tone)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12.5px] font-medium leading-snug text-foreground">
              {issue.title}
            </p>
            {canSelect && (
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-strong bg-card",
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </span>
            )}
          </div>
          {issue.description && (
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              {issue.description}
            </p>
          )}
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/90">
            <span className="font-medium text-foreground/80">
              {t("issues.recommendation")}:
            </span>{" "}
            {issue.recommendation}
          </p>
          {(issue.column || issue.count) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
              {issue.column && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground/80">
                  {issue.column}
                </span>
              )}
              {issue.count !== undefined && (
                <span className="tabular-nums">
                  {issue.count.toLocaleString()} {t("issues.rowsAffected")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
