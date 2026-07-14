import type { Dataset, Issue } from "./types";
import { isNullish } from "./infer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function detectIssues(ds: Dataset): Issue[] {
  const issues: Issue[] = [];

  // duplicates
  const seen = new Map<string, number>();
  for (const r of ds.rows) {
    const k = JSON.stringify(r);
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  const dupCount = [...seen.values()].reduce((s, c) => s + (c > 1 ? c - 1 : 0), 0);
  if (dupCount > 0) {
    issues.push({
      id: "dup",
      type: "duplicates",
      title: `${dupCount} duplicate rows`,
      description: `Found ${dupCount} exact duplicate rows in the dataset.`,
      severity: "warning",
      recommendation: "Remove duplicate rows to avoid biased analytics.",
      op: { kind: "remove_duplicates" },
      count: dupCount,
    });
  }

  for (const col of ds.columns) {
    if (col.stats.missingPct > 0) {
      issues.push({
        id: `missing:${col.name}`,
        column: col.name,
        type: "missing",
        title: `${col.stats.missingPct.toFixed(1)}% missing in "${col.name}"`,
        description: `${col.stats.missing} rows have no value.`,
        severity: col.stats.missingPct > 30 ? "critical" : col.stats.missingPct > 5 ? "warning" : "info",
        recommendation:
          col.type === "integer" || col.type === "float"
            ? "Impute with median or drop rows."
            : "Impute with mode or drop rows.",
        op:
          col.type === "integer" || col.type === "float"
            ? { kind: "fill_null", column: col.name, strategy: "median" }
            : { kind: "fill_null", column: col.name, strategy: "mode" },
        count: col.stats.missing,
      });
    }

    if (col.stats.outliersIQR && col.stats.outliersIQR > 0) {
      issues.push({
        id: `outlier:${col.name}`,
        column: col.name,
        type: "outliers",
        title: `${col.stats.outliersIQR} outliers in "${col.name}"`,
        description: `Detected using the IQR method.`,
        severity: col.stats.outliersIQR / ds.rows.length > 0.05 ? "warning" : "info",
        recommendation: "Review and remove outliers if they are data-entry errors.",
        op: { kind: "remove_outliers", column: col.name, method: "iqr" },
        count: col.stats.outliersIQR,
      });
    }

    if (col.type === "email") {
      const invalid = ds.rows.filter((r) => {
        const v = r[col.name];
        return !isNullish(v) && !EMAIL_RE.test(String(v));
      }).length;
      if (invalid > 0) {
        issues.push({
          id: `email:${col.name}`,
          column: col.name,
          type: "invalid_email",
          title: `${invalid} invalid emails in "${col.name}"`,
          description: `Values do not match a valid email pattern.`,
          severity: "warning",
          recommendation: "Trim spaces, lowercase, or remove invalid rows.",
          op: { kind: "trim", column: col.name },
          count: invalid,
        });
      }
    }

    // whitespace / casing
    if (col.type === "text" || col.type === "categorical" || col.type === "email") {
      let ws = 0;
      let mixedCase = 0;
      const lc = new Set<string>();
      const raw = new Set<string>();
      for (const r of ds.rows) {
        const v = r[col.name];
        if (typeof v === "string") {
          if (v !== v.trim() || /\s{2,}/.test(v)) ws++;
          lc.add(v.toLowerCase());
          raw.add(v);
        }
      }
      if (raw.size - lc.size > 0) mixedCase = raw.size - lc.size;
      if (ws > 0) {
        issues.push({
          id: `ws:${col.name}`,
          column: col.name,
          type: "whitespace",
          title: `${ws} whitespace issues in "${col.name}"`,
          description: "Leading, trailing, or repeated spaces.",
          severity: "info",
          recommendation: "Trim and collapse whitespace.",
          op: { kind: "remove_extra_spaces", column: col.name },
          count: ws,
        });
      }
      if (mixedCase > 0) {
        issues.push({
          id: `case:${col.name}`,
          column: col.name,
          type: "casing",
          title: `Inconsistent casing in "${col.name}"`,
          description: `${mixedCase} values differ only by capitalization.`,
          severity: "info",
          recommendation: "Standardize to lowercase.",
          op: { kind: "lowercase", column: col.name },
          count: mixedCase,
        });
      }
    }

    if (col.stats.unique <= 1 && ds.rows.length > 1) {
      issues.push({
        id: `const:${col.name}`,
        column: col.name,
        type: "constant",
        title: `"${col.name}" is constant`,
        description: "This column has only one unique value.",
        severity: "info",
        recommendation: "Drop the column — it adds no information.",
        op: { kind: "drop_column", column: col.name },
      });
    }
  }

  return issues.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function cleaningScore(ds: Dataset): number {
  const issues = detectIssues(ds);
  const weight = { critical: 15, warning: 6, info: 2 };
  const penalty = issues.reduce((s, i) => s + weight[i.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}
