import { useMemo } from "react";
import type { Dataset } from "@/lib/cleanlab/types";
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { coerceNumber, isNullish } from "@/lib/cleanlab/infer";

const PALETTE = [
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
  borderRadius: 12,
  fontSize: 12,
};

export function AutoCharts({ dataset }: { dataset: Dataset }) {
  const numericCols = dataset.columns.filter((c) => c.type === "integer" || c.type === "float");
  const catCols = dataset.columns.filter((c) => c.type === "categorical" || c.type === "boolean");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {numericCols.slice(0, 2).map((col) => (
        <ChartCard key={`hist-${col.name}`} title={`Histogram — ${col.name}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={col.stats.histogram ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ))}

      {catCols.slice(0, 2).map((col) => (
        <ChartCard key={`bar-${col.name}`} title={`Bar — ${col.name}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={col.stats.top.slice(0, 8).map((t) => ({ name: String(t.value), count: t.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ))}

      {numericCols.length >= 2 && (
        <ChartCard title={`Scatter — ${numericCols[0].name} vs ${numericCols[1].name}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="x" name={numericCols[0].name} tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name={numericCols[1].name} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={dataset.rows
                  .map((r) => ({ x: coerceNumber(r[numericCols[0].name]), y: coerceNumber(r[numericCols[1].name]) }))
                  .filter((p) => p.x !== null && p.y !== null)
                  .slice(0, 500)}
                fill="hsl(var(--primary))"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {catCols[0] && (
        <ChartCard title={`Distribution — ${catCols[0].name}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={catCols[0].stats.top.slice(0, 6).map((t) => ({ name: String(t.value), value: t.count }))}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {catCols[0].stats.top.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {numericCols.length >= 1 && (
        <ChartCard title={`Trend — ${numericCols[0].name}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataset.rows
                .slice(0, 200)
                .map((r, i) => ({ i, v: coerceNumber(r[numericCols[0].name]) ?? 0 }))
                .filter((p) => !isNullish(p.v))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="i" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {numericCols.length >= 2 && <CorrelationHeatmap dataset={dataset} />}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 shadow-soft">
      <div className="mb-3 text-sm font-medium">{title}</div>
      <div className="h-64">{children}</div>
    </Card>
  );
}

function CorrelationHeatmap({ dataset }: { dataset: Dataset }) {
  const numericCols = dataset.columns.filter((c) => c.type === "integer" || c.type === "float");
  const matrix = useMemo(() => {
    const cols = numericCols.map((c) => c.name);
    const arrays = cols.map((n) =>
      dataset.rows.map((r) => coerceNumber(r[n])).filter((v): v is number => v !== null),
    );
    const minLen = Math.min(...arrays.map((a) => a.length));
    const trimmed = arrays.map((a) => a.slice(0, minLen));
    const m: number[][] = [];
    for (let i = 0; i < trimmed.length; i++) {
      m[i] = [];
      for (let j = 0; j < trimmed.length; j++) {
        m[i][j] = pearson(trimmed[i], trimmed[j]);
      }
    }
    return { cols, m };
  }, [numericCols, dataset.rows]);

  return (
    <Card className="p-4 shadow-soft md:col-span-2">
      <div className="mb-3 text-sm font-medium">Correlation heatmap</div>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `120px repeat(${matrix.cols.length}, 60px)` }}
        >
          <div />
          {matrix.cols.map((c) => (
            <div key={c} className="truncate text-center text-[10px] text-muted-foreground">{c}</div>
          ))}
          {matrix.cols.map((r, i) => (
            <div key={r} className="contents">
              <div className="truncate text-right text-[10px] text-muted-foreground pr-2">{r}</div>
              {matrix.m[i].map((v, j) => (
                <div
                  key={j}
                  className="flex h-10 items-center justify-center rounded text-[10px] font-medium"
                  style={{
                    background:
                      v >= 0
                        ? `hsl(221 83% 53% / ${Math.abs(v).toFixed(2)})`
                        : `hsl(0 84% 60% / ${Math.abs(v).toFixed(2)})`,
                    color: Math.abs(v) > 0.5 ? "white" : "hsl(var(--foreground))",
                  }}
                >
                  {v.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}
