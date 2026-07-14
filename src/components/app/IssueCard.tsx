import { AlertTriangle, AlertCircle, Info, Check, Sparkles } from "lucide-react";
import type { Issue } from "@/lib/cleanlab/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
  onFix?: () => void;
  onExplain?: () => void;
  fixing?: boolean;
}

const iconMap = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toneMap = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

export function IssueCard({ issue, onFix, onExplain, fixing }: IssueCardProps) {
  const Icon = iconMap[issue.severity];
  return (
    <Card className="p-4 shadow-soft transition-shadow hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", toneMap[issue.severity])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium">{issue.title}</h4>
            <Badge variant="outline" className="text-[10px] uppercase">
              {issue.severity}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Recommendation: </span>
            {issue.recommendation}
          </p>
          <div className="mt-3 flex gap-2">
            {issue.op && onFix && (
              <Button size="sm" onClick={onFix} disabled={fixing} className="gap-1.5">
                <Check className="h-3.5 w-3.5" />
                {fixing ? "Fixing…" : "Fix now"}
              </Button>
            )}
            {onExplain && (
              <Button size="sm" variant="ghost" onClick={onExplain} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Explain
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
