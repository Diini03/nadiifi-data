import type { Dataset } from "@/lib/cleanlab/types";
import { AiSummary } from "./AiSummary";
import { fillConfidence } from "./BlankFillReview";
import { buildCanonicalMap, canonicalGroups } from "@/lib/cleanlab/canonical";
import { detectIssues } from "@/lib/cleanlab/issues";
import { operationLabel } from "@/lib/cleanlab/operations";

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
      return {
        column: c.name,
        blanks: c.stats.missing,
        missingPct: Math.round(c.stats.missingPct * 10) / 10,
        method,
        value: String((numeric ? c.stats.median : c.stats.mode) ?? "").slice(0, 30),
        confidence: fillConfidence(ds, c.name, method).score,
      };
    });
  const actions = detectIssues(ds)
    .filter((i) => i.op)
    .slice(0, 12)
    .map((i) => ({
      action: i.op ? operationLabel(i.op) : i.title,
      column: i.column,
      severity: i.severity,
      count: i.count,
    }));
  return { name: ds.name, rows: ds.rows.length, merges, fills, actions };
}

export function CleanSuggestions({ dataset }: { dataset: Dataset }) {
  return (
    <AiSummary
      dataset={dataset}
      mode="prioritize"
      digest={() => digest(dataset)}
      title="AI cleaning plan"
      subtitle="Which merges, fills and date fixes to apply first — and which to review. Only summaries are sent — never your rows."
    />
  );
}
