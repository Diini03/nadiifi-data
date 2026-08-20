import type { CellValue, Column, Dataset } from "./types";
import { coerceNumber, isNullish } from "./infer";

/**
 * Semantic role = what a column MEANS, not how it is stored.
 * A numeric customer_id is an identifier, never a measure.
 */
export type SemanticRole =
  | "identifier"
  | "measure"
  | "numeric_dimension"
  | "categorical"
  | "ordinal"
  | "datetime"
  | "geographic"
  | "boolean"
  | "text"
  | "email"
  | "url"
  | "phone"
  | "currency"
  | "percentage"
  | "duration"
  | "code"
  | "unknown";

export const ROLE_LABEL: Record<SemanticRole, string> = {
  identifier: "Identifier",
  measure: "Numeric measure",
  numeric_dimension: "Numeric dimension",
  categorical: "Categorical",
  ordinal: "Ordinal",
  datetime: "Datetime",
  geographic: "Geographic",
  boolean: "Boolean",
  text: "Text",
  email: "Email",
  url: "URL",
  phone: "Phone",
  currency: "Currency",
  percentage: "Percentage",
  duration: "Duration",
  code: "Code",
  unknown: "Unknown",
};

export interface SemanticColumn {
  name: string;
  /** Storage / raw type from the profiler. */
  rawType: Column["type"];
  role: SemanticRole;
  confidence: number; // 0..1
  reason: string;
  recommendedUses: string[];
  avoidUses: string[];
  cardinality: number;
  uniquePct: number;
  missingPct: number;
  examples: CellValue[];
  /** Convenience flags used by the recommendation engine. */
  isMeasure: boolean;
  isDimension: boolean;
  isTime: boolean;
}

const ID_NAME_RE = /(^|[_\s-])(id|uuid|guid|key|code|no|num|number|identifier|ref|sku|isbn)s?($|[_\s-])/i;
const ID_SUFFIX_RE = /(_id|Id|ID|_key|_code|_no|_num)$/;
const GEO_NAME_RE = /(country|region|state|province|city|town|district|zip|postal|postcode|lat|latitude|lon|lng|longitude|county|address)/i;
const CURRENCY_NAME_RE = /(revenue|sales|price|cost|amount|salary|income|profit|spend|budget|fee|total|balance|payment|value)/i;
const PERCENT_NAME_RE = /(pct|percent|percentage|rate|ratio|share)/i;
const DURATION_NAME_RE = /(duration|elapsed|_time|seconds|minutes|hours|days_)/i;
const DATE_NAME_RE = /(date|time|day|month|year|created|updated|hired|joined|timestamp)/i;
const ORDINAL_VALUES = [
  ["low", "medium", "high"],
  ["small", "medium", "large"],
  ["poor", "fair", "good", "excellent"],
  ["s", "m", "l", "xl"],
  ["bronze", "silver", "gold", "platinum"],
];

function isSequential(nums: number[]): boolean {
  if (nums.length < 8) return false;
  const sorted = [...nums].sort((a, b) => a - b);
  let steps = 0;
  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i] - sorted[i - 1];
    if (d > 0 && d <= 3) steps++;
  }
  return steps / (sorted.length - 1) > 0.7;
}

function examplesOf(values: CellValue[], n = 4): CellValue[] {
  const out: CellValue[] = [];
  for (const v of values) {
    if (!isNullish(v)) out.push(v);
    if (out.length >= n) break;
  }
  return out;
}

/** Classify a single column into a semantic role with an explainable reason. */
export function classifyColumn(column: Column, rows: Record<string, CellValue>[]): SemanticColumn {
  const values = rows.map((r) => r[column.name]);
  const nonNull = values.filter((v) => !isNullish(v));
  const total = Math.max(values.length, 1);
  const cardinality = column.stats.unique;
  const uniquePct = nonNull.length ? cardinality / nonNull.length : 0;
  const missingPct = column.stats.missingPct;
  const name = column.name;
  const lower = name.toLowerCase().trim();
  const nameLooksId = ID_NAME_RE.test(lower) || ID_SUFFIX_RE.test(name);
  const numeric = column.type === "integer" || column.type === "float";
  const nums = nonNull.map(coerceNumber).filter((n): n is number => n !== null);

  const build = (
    role: SemanticRole,
    confidence: number,
    reason: string,
    recommendedUses: string[],
    avoidUses: string[],
  ): SemanticColumn => ({
    name,
    rawType: column.type,
    role,
    confidence: Math.min(0.99, Math.max(0.4, confidence)),
    reason,
    recommendedUses,
    avoidUses,
    cardinality,
    uniquePct,
    missingPct,
    examples: examplesOf(values),
    isMeasure: role === "measure" || role === "currency" || role === "percentage" || role === "duration",
    isDimension:
      role === "categorical" ||
      role === "ordinal" ||
      role === "boolean" ||
      role === "geographic" ||
      role === "numeric_dimension",
    isTime: role === "datetime",
  });

  // 1. Direct format detections from the profiler win immediately.
  if (column.type === "email")
    return build("email", 0.97, "Values match an email address pattern.", ["Filtering", "Record identification"], ["Aggregation", "Charts"]);
  if (column.type === "url")
    return build("url", 0.96, "Values are web addresses.", ["Reference"], ["Aggregation", "Charts"]);
  if (column.type === "phone")
    return build("phone", 0.9, "Values match a phone number pattern.", ["Filtering"], ["Aggregation", "Charts"]);
  if (column.type === "date" || (DATE_NAME_RE.test(lower) && column.type !== "integer" && column.type !== "float"))
    return build(
      "datetime",
      column.type === "date" ? 0.96 : 0.7,
      column.type === "date"
        ? "Values parse as valid dates."
        : "The column name suggests a date even though values are not fully parseable.",
      ["Line chart", "Trend over time", "Grouping by period"],
      ["Sum", "Average"],
    );
  if (column.type === "boolean")
    return build("boolean", 0.95, "Only two distinct true/false-like values.", ["Grouping", "Filtering", "Share of total"], ["Sum", "Histogram"]);

  // 2. Identifiers — the most important guardrail.
  if (numeric || column.type === "text" || column.type === "categorical") {
    const nearlyUnique = uniquePct > 0.9 && nonNull.length >= 8;
    const sequential = numeric && isSequential(nums);
    let idScore = 0;
    const signals: string[] = [];
    if (nameLooksId) { idScore += 0.5; signals.push("the name reads like an identifier"); }
    if (nearlyUnique) { idScore += 0.35; signals.push(`${Math.round(uniquePct * 100)}% of values are unique`); }
    if (sequential) { idScore += 0.2; signals.push("values increase in a near-sequential run"); }
    if (numeric && nameLooksId && (column.stats.std ?? 0) === 0) idScore += 0.05;
    if (idScore >= 0.5) {
      return build(
        "identifier",
        0.55 + idScore * 0.45,
        `Looks like a record identifier because ${signals.join(", ")}.`,
        ["Record identification", "Filtering", "Joining", "Counting distinct"],
        ["Sum", "Average", "Histogram", "Bar chart", "Pie chart", "KPI"],
      );
    }
  }

  // 3. Geographic.
  if (GEO_NAME_RE.test(lower) && !numeric)
    return build("geographic", 0.85, "The column name refers to a place and values are labels.", ["Grouping", "Bar chart", "Map"], ["Sum of the column itself"]);
  if (GEO_NAME_RE.test(lower) && numeric && /(zip|postal|postcode)/i.test(lower))
    return build("identifier", 0.92, "Postal codes are numeric labels, not quantities.", ["Grouping", "Filtering"], ["Sum", "Average", "Histogram"]);

  // 4. Numeric roles.
  if (numeric) {
    if (PERCENT_NAME_RE.test(lower))
      return build("percentage", 0.85, "Name and values behave like a rate or percentage.", ["KPI", "Line chart", "Distribution"], ["Sum"]);
    if (CURRENCY_NAME_RE.test(lower))
      return build("currency", 0.9, "Name indicates a monetary amount and values are numeric.", ["KPI", "Bar chart", "Line chart", "Histogram"], ["Grouping as a category"]);
    if (DURATION_NAME_RE.test(lower))
      return build("duration", 0.8, "Name indicates elapsed time stored as a number.", ["Average", "Histogram", "Box plot"], ["Sum across unrelated rows"]);
    // Low-cardinality integers act as dimensions (ratings, years, sizes).
    if (column.type === "integer" && cardinality > 0 && cardinality <= 12 && nonNull.length > cardinality * 3)
      return build(
        "numeric_dimension",
        0.78,
        `Only ${cardinality} distinct whole numbers, so the values behave like buckets rather than a continuous measure.`,
        ["Grouping", "Bar chart", "Counting"],
        ["Average of the column itself"],
      );
    return build(
      "measure",
      0.88,
      `Continuous numeric values (${cardinality} distinct) that vary independently — suitable for aggregation.`,
      ["KPI", "Sum", "Average", "Bar chart", "Line chart", "Histogram", "Scatter"],
      ["Grouping as a category"],
    );
  }

  // 5. Text-ish roles.
  const distinctLower = new Set(nonNull.map((v) => String(v).trim().toLowerCase()));
  for (const scale of ORDINAL_VALUES) {
    if (distinctLower.size >= 2 && [...distinctLower].every((v) => scale.includes(v)))
      return build("ordinal", 0.87, "Values follow a known ordered scale.", ["Ordered bar chart", "Grouping"], ["Sum", "Average"]);
  }
  if (cardinality > 0 && cardinality <= 25 && uniquePct < 0.5)
    return build(
      "categorical",
      0.9,
      `${cardinality} repeated labels across ${nonNull.length} rows — a grouping dimension.`,
      ["Grouping", "Bar chart", "Pie chart (few categories)", "Filtering"],
      ["Sum", "Average", "Histogram"],
    );
  if (uniquePct > 0.8)
    return build(
      "text",
      0.8,
      "Mostly free-form, near-unique text such as names or descriptions.",
      ["Search", "Record identification"],
      ["Charts", "Aggregation"],
    );
  if (cardinality <= 60)
    return build("categorical", 0.7, `${cardinality} distinct labels — usable as a grouping dimension, though cardinality is high.`, ["Grouping", "Top-N bar chart"], ["Pie chart", "Aggregation"]);

  return build("unknown", 0.5, "Nadiifi is not confident about this column — review it before analysing.", ["Manual review"], ["Automatic charts"]);
}

export function classifyDataset(dataset: Dataset): SemanticColumn[] {
  return dataset.columns.map((c) => classifyColumn(c, dataset.rows));
}

export function roleTone(role: SemanticRole): string {
  switch (role) {
    case "identifier":
      return "text-warning bg-warning/15";
    case "measure":
    case "currency":
    case "percentage":
    case "duration":
      return "text-primary bg-primary/15";
    case "datetime":
      return "text-info bg-info/15";
    case "categorical":
    case "ordinal":
    case "boolean":
    case "geographic":
    case "numeric_dimension":
      return "text-success bg-success/15";
    default:
      return "text-muted-foreground bg-muted";
  }
}
