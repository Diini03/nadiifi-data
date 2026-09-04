import type { Dataset } from "./types";
import { recommendCharts, type ChartSpec } from "./recommend";
import type { SemanticColumn } from "./semantics";

export type TemplateId = "executive" | "analytical" | "story" | "minimal";

export const TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: "executive", label: "Executive", description: "Big KPIs, one hero trend, supporting comparisons." },
  { id: "analytical", label: "Analytical", description: "Balanced grid with every meaningful chart." },
  { id: "story", label: "Data story", description: "One large visual plus written findings." },
  { id: "minimal", label: "Minimal", description: "Three KPIs and two charts, lots of whitespace." },
];

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface DashboardCard {
  spec: ChartSpec;
  span: 1 | 2;
}

export interface DashboardSpec {
  title: string;
  domain: string;
  kpis: DashboardKpi[];
  cards: DashboardCard[];
  insights: string[];
  columns: SemanticColumn[];
}

const DOMAINS: { name: string; keys: RegExp }[] = [
  { name: "Sales", keys: /(revenue|sales|order|invoice|discount|quantity|unit_price)/i },
  { name: "E-commerce", keys: /(cart|checkout|sku|shipping|product_id|coupon)/i },
  { name: "HR", keys: /(employee|salary|department|hire|manager|attrition|tenure)/i },
  { name: "Education", keys: /(student|score|grade|exam|attendance|course|teacher)/i },
  { name: "Finance", keys: /(transaction|account|balance|credit|debit|interest|portfolio)/i },
  { name: "Marketing", keys: /(campaign|impression|click|ctr|channel|lead|conversion)/i },
  { name: "Agriculture", keys: /(crop|yield|harvest|farm|hectare|irrigation|livestock)/i },
  { name: "Healthcare", keys: /(patient|diagnosis|treatment|hospital|clinic|dose)/i },
];

function detectDomain(columns: SemanticColumn[]): string {
  const joined = columns.map((c) => c.name).join(" ");
  let best = { name: "General", hits: 0 };
  for (const d of DOMAINS) {
    const hits = columns.filter((c) => d.keys.test(c.name)).length;
    if (hits > best.hits) best = { name: d.name, hits };
  }
  return best.hits >= 2 || (best.hits === 1 && joined.length < 60) ? best.name : "General";
}

const fmt = (n: number) =>
  Math.abs(n) >= 1000
    ? n.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })
    : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

function buildInsights(cards: DashboardCard[], dataset: Dataset): string[] {
  const out: string[] = [];
  for (const { spec } of cards) {
    const data = spec.data as Array<{ label: string; value: number }>;
    if (data.length < 2) continue;
    if (spec.kind === "bar" && spec.dimension) {
      const total = data.reduce((s, d) => s + Number(d.value || 0), 0);
      const top = data[0];
      if (total > 0)
        out.push(
          `${top.label} leads ${spec.dimension} with ${fmt(Number(top.value))} (${Math.round((Number(top.value) / total) * 100)}% of the ${spec.measure ?? "record"} total across ${data.length} groups).`,
        );
    }
    if (spec.kind === "line") {
      const first = Number(data[0].value);
      const last = Number(data[data.length - 1].value);
      if (first !== 0) {
        const change = ((last - first) / Math.abs(first)) * 100;
        out.push(
          `${spec.measure} moved from ${fmt(first)} in ${data[0].label} to ${fmt(last)} in ${data[data.length - 1].label}, a ${change >= 0 ? "rise" : "fall"} of ${Math.abs(Math.round(change))}% over ${data.length} periods.`,
        );
      }
    }
    if (spec.kind === "histogram" && spec.measure) {
      const peak = data.reduce((a, b) => (Number(b.value) > Number(a.value) ? b : a));
      out.push(`${spec.measure} clusters most heavily around ${peak.label}, with ${fmt(Number(peak.value))} rows in that bin.`);
    }
    if (out.length >= 3) break;
  }
  if (out.length === 0)
    out.push(`The dataset holds ${dataset.rows.length.toLocaleString()} rows across ${dataset.columns.length} columns; no comparison stood out strongly enough to summarise.`);
  return out.slice(0, 3);
}

/** Deterministically composes a dataset-specific dashboard for a template. */
export function composeDashboard(dataset: Dataset, template: TemplateId): DashboardSpec {
  const rec = recommendCharts(dataset, 12);
  const domain = detectDomain(rec.columns);

  const kpiSpecs = rec.charts.filter((c) => c.kind === "kpi");
  const kpis: DashboardKpi[] = [
    {
      id: "rows",
      label: "Records",
      value: dataset.rows.length.toLocaleString(),
      hint: `${dataset.columns.length} columns profiled`,
    },
    ...kpiSpecs.map((s) => ({
      id: s.id,
      label: s.title,
      value: fmt(Number((s.data[0] as { value: number })?.value ?? 0)),
      hint: s.why,
    })),
  ];

  // Rank charts, drop redundant dimension/measure repeats.
  const seen = new Set<string>();
  const ranked = rec.charts
    .filter((c) => c.kind !== "kpi")
    .sort((a, b) => b.confidence - a.confidence)
    .filter((c) => {
      const key = `${c.kind}:${c.dimension ?? ""}:${c.measure ?? ""}`;
      const pair = `${c.dimension ?? ""}:${c.measure ?? ""}`;
      if (seen.has(key) || (c.dimension && seen.has(pair))) return false;
      seen.add(key);
      if (c.dimension) seen.add(pair);
      return true;
    });

  const limits: Record<TemplateId, { kpis: number; charts: number }> = {
    executive: { kpis: 4, charts: 4 },
    analytical: { kpis: 4, charts: 6 },
    story: { kpis: 3, charts: 3 },
    minimal: { kpis: 3, charts: 2 },
  };
  const limit = limits[template];
  const chosen = ranked.slice(0, limit.charts);

  const cards: DashboardCard[] = chosen.map((spec, i) => {
    if (template === "executive") return { spec, span: i === 0 ? 2 : 1 };
    if (template === "story") return { spec, span: i === 0 ? 2 : 1 };
    if (template === "minimal") return { spec, span: 1 };
    return { spec, span: spec.kind === "line" ? 2 : 1 };
  });

  const measure = rec.columns.find((c) => c.isMeasure);
  const title =
    domain === "General"
      ? `${dataset.name} overview`
      : `${domain} ${measure ? "performance" : "overview"}${measure ? "" : ""}`.replace(/\s+/g, " ");

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    domain,
    kpis: kpis.slice(0, limit.kpis),
    cards,
    insights: buildInsights(cards, dataset),
    columns: rec.columns,
  };
}
