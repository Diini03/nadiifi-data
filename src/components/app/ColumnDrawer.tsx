import type { Column } from "@/lib/cleanlab/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface ColumnDrawerProps {
  column: Column | null;
  onClose: () => void;
}

export function ColumnDrawer({ column, onClose }: ColumnDrawerProps) {
  const open = !!column;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {column && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle className="truncate">{column.name}</SheetTitle>
                <Badge variant="outline" className="uppercase">{column.type}</Badge>
              </div>
              <SheetDescription>
                Distribution and quality profile for this column.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Missing" value={`${column.stats.missingPct.toFixed(1)}%`} />
              <Stat label="Unique" value={formatNumber(column.stats.unique)} />
              <Stat label="Mode" value={String(column.stats.mode ?? "—")} />
              {column.stats.mean !== undefined && (
                <>
                  <Stat label="Mean" value={formatNumber(column.stats.mean)} />
                  <Stat label="Median" value={formatNumber(column.stats.median)} />
                  <Stat label="Std dev" value={formatNumber(column.stats.std)} />
                  <Stat label="Min" value={formatNumber(column.stats.min)} />
                  <Stat label="Max" value={formatNumber(column.stats.max)} />
                </>
              )}
            </div>

            {column.stats.histogram && column.stats.histogram.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-sm font-medium">Distribution</div>
                <div className="h-48 rounded-2xl border bg-card p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={column.stats.histogram}>
                      <XAxis dataKey="bin" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {column.stats.histogram.map((_, i) => (
                          <Cell key={i} fill="hsl(var(--primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {column.stats.top.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-sm font-medium">Top values</div>
                <div className="space-y-1.5">
                  {column.stats.top.map((t, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                      <span className="truncate">{String(t.value)}</span>
                      <span className="text-xs text-muted-foreground">{t.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}
