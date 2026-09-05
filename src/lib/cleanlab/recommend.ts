import type { CellValue, Dataset } from "./types";
import { coerceNumber, isNullish } from "./infer";
import { classifyDataset, type SemanticColumn } from "./semantics";
import { buildCanonicalMap, canonicalLabel } from "./canonical";

export type ChartKind = "bar" | "line" | "pie" | "histogram" | "scatter" | "kpi";

export interface ChartSpec {
  id: string;
  kind: ChartKind;
  title: string;
  subtitle: string;
  /** Why Nadiifi thinks this chart is meaningful. */
  why: string;
  confidence: number; // 0..1
  dimension?: string;
  measure?: string;
  secondMeasure?: string;
  aggregation?: "sum" | "avg" | "count";
  data: Array<Record<string, CellValue | number>>;
}

export interface RejectedChart {
  title: string;
  reason: string;
}

export interface Recommendations {
  columns: SemanticColumn[];
  charts: ChartSpec[];
  rejected: RejectedChart[];
}

const num = (v: CellValue) => coerceNumber(v);

/** Measures where a total is meaningless — averages are the honest summary. */
const NON_ADDITIVE = /(gpa|grade|score|rate|ratio|percent|pct|share|avg|average|mean|median|age|temp|temperature|price|rating|index|bmi|weight|height|score_|_score|level|satisfaction|efficiency|density|speed)/i;

export function isAdditive(col: SemanticColumn): boolean {
  if (col.role === "percentage") return false;
  return !NON_ADDITIVE.test(col.name);
}

export function defaultAggregation(col: SemanticColumn | undefined): "sum" | "avg" {
  return col && isAdditive(col) ? "sum" : "avg";
}

function aggregate(
  rows: Record<string, CellValue>[],
  dim: string,
  measure: string | null,
  mode: "sum" | "avg" | "count",
) {
  // Merge spelling / casing / short-code variants ("M", " male ", "Male").
  const canon = buildCanonicalMap(rows.map((r) => r[dim]));
  const map = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const key = canonicalLabel(row[dim], canon);
    if (!key) continue;
    const entry = map.get(key) ?? { total: 0, count: 0 };
    if (measure) {
      const n = num(row[measure]);
      if (n === null) continue;
      entry.total += n;
    }
    entry.count += 1;
    map.set(key, entry);
  }
  return [...map.entries()]
    .map(([label, v]) => ({
      label,
      value:
        mode === "count"
          ? v.count
          : mode === "avg"
          ? v.count
            ? Number((v.total / v.count).toFixed(4))
            : 0
          : v.total,
    }))
    .sort((a, b) => b.value - a.value);
}

function timeSeries(
  rows: Record<string, CellValue>[],
  timeCol: string,
  measure: string,
  mode: "sum" | "avg" = "sum",
) {
  const map = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const raw = row[timeCol];
    if (isNullish(raw)) continue;
    const d = new Date(String(raw));
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const n = num(row[measure]);
    if (n === null) continue;
    const e = map.get(key) ?? { total: 0, count: 0 };
    e.total += n;
    e.count += 1;
    map.set(key, e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, v]) => ({
      label,
      value: mode === "avg" ? Number((v.total / v.count).toFixed(4)) : v.total,
    }));
}

function histogram(rows: Record<string, CellValue>[], col: string, bins = 12) {
  const nums = rows.map((r) => num(r[col])).filter((n): n is number => n !== null);
  if (nums.length < 8) return [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const step = (max - min) / bins || 1;
  const out = Array.from({ length: bins }, (_, i) => ({
    label: (min + i * step).toFixed(min === max ? 0 : 1),
    value: 0,
  }));
  for (const n of nums) {
    let idx = Math.floor((n - min) / step);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    out[idx].value++;
  }
  return out;
}

function pct(n: number) {
  return Math.round(n * 100);
}

/**
 * Builds chart recommendations from semantic roles — identifiers are never
 * summed, high-cardinality text is never charted, and every suggestion carries
 * a confidence score and an explanation.
 */
export function recommendCharts(dataset: Dataset, limit = 8): Recommendations {
  const columns = classifyDataset(dataset);
  const rows = dataset.rows;
  const charts: ChartSpec[] = [];
  const rejected: RejectedChart[] = [];

  const measures = columns.filter((c) => c.isMeasure && c.missingPct < 60);
  const dimensions = columns
    .filter((c) => c.isDimension && c.cardinality >= 2 && c.cardinality <= 25)
    .sort((a, b) => a.cardinality - b.cardinality);
  const times = columns.filter((c) => c.isTime);

  for (const c of columns) {
    if (c.role === "identifier")
      rejected.push({
        title: `${c.name} charts`,
        reason: `Skipped: ${c.name} is an identifier (${c.reason.replace(/^Looks like a record identifier because /, "")}). Summing or averaging it would be meaningless.`,
      });
    if (c.role === "text")
      rejected.push({ title: `${c.name} breakdown`, reason: `Skipped: ${c.name} holds near-unique free text, so a chart would have one bar per row.` });
    if (c.isDimension && c.cardinality > 25)
      rejected.push({ title: `${c.name} breakdown`, reason: `Skipped: ${c.name} has ${c.cardinality} distinct values — too many for a readable chart.` });
  }

  // KPIs from the strongest measures.
  for (const m of measures.slice(0, 3)) {
    const nums = rows.map((r) => num(r[m.name])).filter((n): n is number => n !== null);
    if (nums.length === 0) continue;
    const total = nums.reduce((s, n) => s + n, 0);
    const avg = total / nums.length;
    const isRate = !isAdditive(m);
    charts.push({
      id: `kpi-${m.name}`,
      kind: "kpi",
      title: isRate ? `Average ${m.name}` : `Total ${m.name}`,
      subtitle: isRate ? `${nums.length} values` : `avg ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })} across ${nums.length} rows`,
      why: `${m.name} is a ${m.role === "currency" ? "monetary" : "continuous"} measure, so a ${isRate ? "mean" : "total"} is the right summary.`,
      confidence: m.confidence,
      measure: m.name,
      aggregation: isRate ? "avg" : "sum",
      data: [{ label: m.name, value: isRate ? avg : total }],
    });
  }

  // Time series.
  for (const t of times.slice(0, 1)) {
    for (const m of measures.slice(0, 2)) {
      const lineAgg = defaultAggregation(m);
      const data = timeSeries(rows, t.name, m.name, lineAgg);
      if (data.length < 3) {
        rejected.push({ title: `${m.name} over ${t.name}`, reason: `Skipped: fewer than 3 usable time periods after parsing ${t.name}.` });
        continue;
      }
      charts.push({
        id: `line-${t.name}-${m.name}`,
        kind: "line",
        title: `${m.name} over time`,
        subtitle: `monthly ${lineAgg === "avg" ? "average" : "total"}, grouped by ${t.name}`,
        why: `${t.name} is a datetime column and ${m.name} is an additive measure — a trend line shows how it moves across ${data.length} periods.`,
        confidence: Math.min(0.95, (t.confidence + m.confidence) / 2 + 0.05),
        dimension: t.name,
        measure: m.name,
        aggregation: lineAgg,
        data,
      });
    }
  }

  // Dimension × measure bars.
  for (const d of dimensions.slice(0, 3)) {
    const m = measures[0];
    if (m) {
      const agg = defaultAggregation(m);
      const data = aggregate(rows, d.name, m.name, agg).slice(0, 12);
      if (data.length >= 2) {
        charts.push({
          id: `bar-${d.name}-${m.name}`,
          kind: "bar",
          title: `${agg === "avg" ? "Average " : ""}${m.name} by ${d.name}`,
          subtitle: `${data.length} groups, ${agg === "avg" ? "averaged" : "summed"}`,
          why: `${d.name} is a ${d.role === "geographic" ? "geographic" : "categorical"} dimension with ${d.cardinality} groups, and ${m.name} is ${agg === "avg" ? "not additive, so each group shows its mean" : "additive — the classic comparison view"}.`,
          confidence: Math.min(0.96, (d.confidence + m.confidence) / 2 + 0.04),
          dimension: d.name,
          measure: m.name,
          aggregation: agg,
          data,
        });
      }
    } else {
      const data = aggregate(rows, d.name, null, "count").slice(0, 12);
      if (data.length >= 2)
        charts.push({
          id: `bar-count-${d.name}`,
          kind: "bar",
          title: `Records by ${d.name}`,
          subtitle: `${data.length} groups, counted`,
          why: `No additive measure was found, so Nadiifi counts records per ${d.name} instead.`,
          confidence: d.confidence * 0.9,
          dimension: d.name,
          aggregation: "count",
          data,
        });
    }
  }

  // Composition pie for a small dimension.
  const pieDim = dimensions.find((d) => d.cardinality >= 2 && d.cardinality <= 6);
  if (pieDim) {
    const m = measures[0];
    const pieAgg = m ? defaultAggregation(m) : "count";
    const data = aggregate(rows, pieDim.name, m ? m.name : null, pieAgg);
    if (data.length >= 2)
      charts.push({
        id: `pie-${pieDim.name}`,
        kind: "pie",
        title: `Share by ${pieDim.name}`,
        subtitle: m ? (pieAgg === "avg" ? `average ${m.name} per group` : `share of ${m.name}`) : "share of records",
        why: `${pieDim.name} has only ${pieDim.cardinality} groups, which is few enough for a part-to-whole view.`,
        confidence: Math.min(0.9, pieDim.confidence),
        dimension: pieDim.name,
        measure: m?.name,
        aggregation: pieAgg,
        data,
      });
  } else if (dimensions.length > 0) {
    rejected.push({ title: "Pie chart", reason: "Skipped: no dimension has 6 or fewer groups, and pie charts stop being readable beyond that." });
  }

  // Distribution.
  for (const m of measures.slice(0, 2)) {
    const data = histogram(rows, m.name);
    if (data.length === 0) continue;
    charts.push({
      id: `hist-${m.name}`,
      kind: "histogram",
      title: `Distribution of ${m.name}`,
      subtitle: "12 bins",
      why: `${m.name} is continuous, so its shape (skew, clustering, outliers) matters as much as its total.`,
      confidence: m.confidence * 0.92,
      measure: m.name,
      data,
    });
  }

  // Relationship between two measures.
  if (measures.length >= 2) {
    const [a, b] = measures;
    const data = rows
      .map((r) => ({ x: num(r[a.name]), y: num(r[b.name]) }))
      .filter((p): p is { x: number; y: number } => p.x !== null && p.y !== null)
      .slice(0, 800);
    if (data.length >= 10)
      charts.push({
        id: `scatter-${a.name}-${b.name}`,
        kind: "scatter",
        title: `${a.name} vs ${b.name}`,
        subtitle: `${data.length} points`,
        why: `Both ${a.name} and ${b.name} are independent measures, so a scatter plot reveals whether they move together.`,
        confidence: Math.min(0.85, (a.confidence + b.confidence) / 2),
        measure: a.name,
        secondMeasure: b.name,
        data: data.map((p) => ({ label: String(p.x), value: p.y, x: p.x, y: p.y })),
      });
  }

  charts.sort((x, y) => {
    const order: Record<ChartKind, number> = { kpi: 0, line: 1, bar: 2, pie: 3, histogram: 4, scatter: 5 };
    if (order[x.kind] !== order[y.kind]) return order[x.kind] - order[y.kind];
    return y.confidence - x.confidence;
  });

  return { columns, charts: charts.slice(0, limit + 3), rejected };
}

export function confidenceLabel(c: number): { label: string; tone: string } {
  const p = pct(c);
  if (p >= 85) return { label: `High · ${p}%`, tone: "text-success bg-success/15" };
  if (p >= 65) return { label: `Medium · ${p}%`, tone: "text-info bg-info/15" };
  return { label: `Low · ${p}%`, tone: "text-warning bg-warning/15" };
}
