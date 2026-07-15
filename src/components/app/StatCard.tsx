import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning";
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  const iconTone = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  }[tone];

  return (
    <Card className="flex items-start justify-between gap-3 p-4 shadow-soft transition-shadow duration-150 hover:shadow-card">
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </div>
      {Icon && (
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", iconTone)}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      )}
    </Card>
  );
}
