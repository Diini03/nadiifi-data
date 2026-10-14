import type { Dataset } from "@/lib/cleanlab/types";
import { AiSummary } from "./AiSummary";
import { fillConfidence } from "./BlankFillReview";
import { buildCanonicalMap, canonicalGroups } from "@/lib/cleanlab/canonical";
import { detectIssues } from "@/lib/cleanlab/issues";

function digest(ds: Dataset) {
  const merges = ds.columns
    .filter((c) => c.type === "categorical" || c.type === "text")
    .map((c) => ({
      column: c.name,
      groups: canonicalGroups(buildCanonicalMap(ds.rows.map((r) => r[c.name])))
        .filter((g) => g.variants.length > 1)
        .slice(0, 6)
        .map((g) => ({ to: g.label, from: g.variants.slice(0, 6).map((v) => v.slice(0, 30)) })),
    }))
    .filter((m) => m.groups.length);
  const fills = ds.columns
    .filter((c) => c.stats.missing > 0 && c.stats.missingPct < 100)
    .map((c) => {
      const numeric = c.type === "integer" || c.type === "float";
      const method = numeric ? "median" : "mode";
      const value = numeric ? c.stats.median : c.stats.mode;
      return { column: c.name, blanks: c.stats.missing, method, value: String(value ?? "").slice(0, 30), confidence: fillConfidence(ds, c.name, method).score };
    });
  const other = detectIssues(ds)
    .filter((i) => ["duplicates", "duplicate_keys", "mixed_dates"].includes(i.type))
    .map((i) => ({ title: i.title, column: i.column }));
  return { name: ds.name, rows: ds.rows.length, merges, fills, other };
}

export function CleanBriefing({ dataset }: { dataset: Dataset }) {
  return (
    <AiSummary
      dataset={dataset}
      mode="clean"
      digest={() => digest(dataset)}
      title="AI cleaning explainer"
      subtitle="What each merge and fill will change, and how safe it is. Only summaries are sent — never your rows."
    />
  );
}
