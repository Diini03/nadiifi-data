import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/EmptyState";
import { BarChart3, Ban } from "lucide-react";
import type { Dataset } from "@/lib/cleanlab/types";
import { recommendCharts, confidenceLabel, type ChartSpec } from "@/lib/cleanlab/recommend";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(217 91% 70%)",
  "hsl(280 60% 60%)",
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};
const tickStyle = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };

const compact = (n: number) =>
  Math.abs(n) >= 1000
    ? n.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })
    : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

/** Renders a single recommended chart spec. */
export function SpecChart({ spec, height = 220 }: { spec: ChartSpec; height?: number }) {
  const data = spec.data as Array<{ label: string; value: number; x?: number; y?: number }>;

  if (spec.kind === "kpi") {
    return (
      <div className="flex h-full flex-col justify-center">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {spec.title}
        </div>
        <div className="mt-1 font-display text-3xl font-semibold tabular-nums">
          {compact(Number(data[0]?.value ?? 0))}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{spec.subtitle}</div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {spec.kind === "line" ? (
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        ) : spec.kind === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="52%" outerRadius="80%" paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        ) : spec.kind === "scatter" ? (
          <ScatterChart margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" dataKey="x" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={compact} />
            <YAxis type="number" dataKey="y" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data} fill="hsl(var(--primary))" />
          </ScatterChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} interval={0} height={36} angle={-15} textAnchor="end" />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar
              dataKey="value"
              fill={spec.kind === "histogram" ? "hsl(var(--info))" : "hsl(var(--primary))"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function SmartChartCard({ spec }: { spec: ChartSpec }) {
  const conf = confidenceLabel(spec.confidence);
  return (
    <Card className="p-4 shadow-soft transition-shadow hover:shadow-card">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{spec.title}</div>
          <div className="truncate text-xs text-muted-foreground">{spec.subtitle}</div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", conf.tone)}>
          {conf.label}
        </span>
      </div>
      <SpecChart spec={spec} />
      <p className="mt-3 border-t border-border/70 pt-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Why: </span>
        {spec.why}
      </p>
    </Card>
  );
}

export function SmartCharts({ dataset }: { dataset: Dataset }) {
  const rec = useMemo(() => recommendCharts(dataset), [dataset]);
  const charts = rec.charts.filter((c) => c.kind !== "kpi");

  if (charts.length === 0 && rec.rejected.length === 0)
    return (
      <EmptyState
        icon={BarChart3}
        title="Nothing worth charting yet"
        description="Nadiifi found no measure or grouping column it can chart meaningfully."
      />
    );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {charts.map((c) => (
          <SmartChartCard key={c.id} spec={c} />
        ))}
      </div>

      {rec.rejected.length > 0 && (
        <Card className="p-4 shadow-soft">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Ban className="h-4 w-4 text-warning" />
            Deliberately not charted
            <Badge variant="outline" className="text-[10px]">{rec.rejected.length}</Badge>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {rec.rejected.slice(0, 8).map((r, i) => (
              <li key={i}>
                <span className="font-medium text-foreground">{r.title}</span> — {r.reason}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
