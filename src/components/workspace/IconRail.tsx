import { LayoutGrid, History, Settings, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export type RailView = "workspace" | "history" | "settings";

interface Props {
  active: RailView;
  onChange: (v: RailView) => void;
}

export function IconRail({ active, onChange }: Props) {
  const { t } = useI18n();
  const items: { id: RailView; icon: typeof LayoutGrid; label: string }[] = [
    { id: "workspace", icon: LayoutGrid, label: t("rail.workspace") },
    { id: "history", icon: History, label: t("rail.history") },
    { id: "settings", icon: Settings, label: t("rail.settings") },
  ];
  return (
    <aside
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border/70 bg-sidebar/40 py-3"
      aria-label="Primary navigation"
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg">
        <Logo size={22} />
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <Tooltip key={it.id} delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onChange(it.id)}
                  aria-label={it.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  {isActive && (
                    <span className="absolute -left-0.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{it.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <a
            href="https://github.com/Diini03/nadiifi-data"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Help"
          >
            <HelpCircle className="h-4.5 w-4.5" strokeWidth={1.75} />
          </a>
        </TooltipTrigger>
        <TooltipContent side="right">Help</TooltipContent>
      </Tooltip>
    </aside>
  );
}
