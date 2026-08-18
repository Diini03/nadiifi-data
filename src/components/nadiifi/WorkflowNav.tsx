import { Database, Sparkles, LineChart, BarChart3, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = "data" | "clean" | "analyze" | "visualize" | "export";

const STEPS: { id: Step; label: string; icon: typeof Database }[] = [
  { id: "data", label: "Data", icon: Database },
  { id: "clean", label: "Clean", icon: Sparkles },
  { id: "analyze", label: "Analyze", icon: LineChart },
  { id: "visualize", label: "Visualize", icon: BarChart3 },
  { id: "export", label: "Export", icon: Download },
];

interface Props {
  active: Step;
  onChange: (s: Step) => void;
  disabled?: boolean;
  /** Step to nudge the user towards next (pulsing ring). */
  suggested?: Step | null;
}

export function WorkflowNav({ active, onChange, disabled, suggested }: Props) {
  const activeIndex = STEPS.findIndex((s) => s.id === active);

  return (
    <nav
      aria-label="Workflow"
      className="sticky top-14 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === active;
          const done = i < activeIndex;
          const hint = !isActive && suggested === s.id;

          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(s.id)}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : done
                    ? "text-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                disabled && "pointer-events-none opacity-40",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
