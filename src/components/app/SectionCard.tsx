import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  padded?: boolean;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  padded = true,
}: SectionCardProps) {
  return (
    <Card className={cn("shadow-soft", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(padded && "p-6", contentClassName)}>{children}</div>
    </Card>
  );
}
