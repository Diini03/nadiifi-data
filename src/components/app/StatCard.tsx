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
    <Card className="flex items-start justify-between gap-4 p-5 shadow-soft transition-shadow hover:shadow-card">
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </div>
      {Icon && (
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconTone)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </Card>
  );
}
