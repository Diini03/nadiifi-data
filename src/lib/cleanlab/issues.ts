import type { Dataset, Issue } from "./types";
import { coerceNumber, isNullish } from "./infer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s\d]{7,}$/;
const MOJIBAKE_RE = /Ã.|Â.|â€™|â€œ|â€|Ã©|Ã¨/;

function normalizeToken(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function detectIssues(ds: Dataset): Issue[] {
  const issues: Issue[] = [];

  // ---- duplicate rows
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
      description: `${dupCount} exact duplicate rows in the dataset.`,
      severity: "warning",
      recommendation: "Remove duplicate rows to avoid biased analytics.",
      op: { kind: "remove_duplicates" },
      count: dupCount,
    });
  }

  // ---- empty rows
  const emptyRows = ds.rows.filter((r) => Object.values(r).every((v) => isNullish(v))).length;
  if (emptyRows > 0) {
    issues.push({
      id: "empty_rows",
      type: "empty_rows",
      title: `${emptyRows} empty rows`,
      description: `${emptyRows} rows contain no values at all.`,
      severity: "warning",
      recommendation: "Drop empty rows — they contribute nothing to analysis.",
      op: { kind: "drop_empty_rows" },
      count: emptyRows,
    });
  }

  // ---- empty columns
  const emptyCols = ds.columns.filter((c) => c.stats.missingPct >= 100);
  if (emptyCols.length > 0) {
    issues.push({
      id: "empty_columns",
      type: "empty_columns",
      title: `${emptyCols.length} empty columns`,
      description: `Columns with no values: ${emptyCols.map((c) => `"${c.name}"`).join(", ")}.`,
      severity: "warning",
      recommendation: "Drop empty columns — they hold no information.",
      op: { kind: "drop_empty_columns" },
      count: emptyCols.length,
    });
  }

  // ---- duplicate columns (same values across every row)
  const colNames = ds.columns.map((c) => c.name);
  const dupColPairs: string[] = [];
  for (let i = 0; i < colNames.length; i++) {
    for (let j = i + 1; j < colNames.length; j++) {
      const a = colNames[i];
      const b = colNames[j];
      if (ds.rows.every((r) => String(r[a] ?? "") === String(r[b] ?? ""))) {
        dupColPairs.push(`${a} = ${b}`);
      }
    }
  }
  if (dupColPairs.length > 0) {
    issues.push({
      id: "dup_columns",
      type: "duplicate_columns",
      title: `${dupColPairs.length} duplicate columns`,
      description: `Columns with identical values: ${dupColPairs.join(", ")}.`,
      severity: "warning",
      recommendation: "Drop duplicate columns to reduce noise.",
      op: { kind: "drop_duplicate_columns" },
      count: dupColPairs.length,
    });
  }

  // ---- per-column checks
  for (const col of ds.columns) {
    if (col.stats.missingPct === 100) continue; // already covered by empty_columns

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
        description: "Detected using the IQR method.",
        severity: col.stats.outliersIQR / ds.rows.length > 0.05 ? "warning" : "info",
        recommendation: "Review and remove outliers if they are data-entry errors.",
        op: { kind: "remove_outliers", column: col.name, method: "iqr" },
        count: col.stats.outliersIQR,
      });
    }

    if (col.type === "email") {
      const invalid = ds.rows.filter((r) => {
        const v = r[col.name];
        return !isNullish(v) && !EMAIL_RE.test(String(v).trim());
      }).length;
      if (invalid > 0) {
        issues.push({
          id: `email:${col.name}`,
          column: col.name,
          type: "invalid_email",
          title: `${invalid} invalid emails in "${col.name}"`,
          description: "Values do not match a valid email pattern.",
          severity: "warning",
          recommendation: "Trim, lowercase, or remove invalid rows.",
          op: { kind: "trim", column: col.name },
          count: invalid,
        });
      }
    }

    if (col.type === "phone") {
      const invalid = ds.rows.filter((r) => {
        const v = r[col.name];
        if (isNullish(v)) return false;
        const s = String(v).trim();
        return !(PHONE_RE.test(s) && /\d{4,}/.test(s));
      }).length;
      if (invalid > 0) {
        issues.push({
          id: `phone:${col.name}`,
          column: col.name,
          type: "invalid_phone",
          title: `${invalid} invalid phone numbers in "${col.name}"`,
          description: "Values do not match a valid phone number pattern.",
          severity: "warning",
          recommendation: "Trim and normalize phone formatting.",
          op: { kind: "trim", column: col.name },
          count: invalid,
        });
      }
    }

    if (col.type === "date") {
      const invalid = ds.rows.filter((r) => {
        const v = r[col.name];
        if (isNullish(v)) return false;
        const d = new Date(String(v));
        return Number.isNaN(d.getTime());
      }).length;
      if (invalid > 0) {
        issues.push({
          id: `date:${col.name}`,
          column: col.name,
          type: "invalid_date",
          title: `${invalid} invalid dates in "${col.name}"`,
          description: "Values could not be parsed as a valid date.",
          severity: "warning",
          recommendation: "Standardize date formatting to ISO (YYYY-MM-DD).",
          op: { kind: "parse_date", column: col.name },
          count: invalid,
        });
      }
    }

    // ---- whitespace, casing, inconsistency, mojibake, numeric-as-text on text-like columns
    if (col.type === "text" || col.type === "categorical" || col.type === "email") {
      let ws = 0;
      let mojibake = 0;
      let numericLike = 0;
      let nonNull = 0;
      const lc = new Set<string>();
      const raw = new Set<string>();
      const normGroups = new Map<string, Set<string>>();
      for (const r of ds.rows) {
        const v = r[col.name];
        if (isNullish(v)) continue;
        nonNull++;
        if (typeof v === "string") {
          if (v !== v.trim() || /\s{2,}/.test(v)) ws++;
          if (MOJIBAKE_RE.test(v)) mojibake++;
          lc.add(v.toLowerCase());
          raw.add(v);
          const n = normalizeToken(v);
          if (n) {
            if (!normGroups.has(n)) normGroups.set(n, new Set());
            normGroups.get(n)!.add(v);
          }
        }
        if (coerceNumber(v) !== null) numericLike++;
      }
      const mixedCase = raw.size - lc.size;

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
          title: `Inconsistent capitalization in "${col.name}"`,
          description: `${mixedCase} values differ only by capitalization.`,
          severity: "info",
          recommendation: "Standardize to lowercase.",
          op: { kind: "lowercase", column: col.name },
          count: mixedCase,
        });
      }
      if (mojibake > 0) {
        issues.push({
          id: `enc:${col.name}`,
          column: col.name,
          type: "encoding",
          title: `${mojibake} possible encoding issues in "${col.name}"`,
          description: "Values contain characters that suggest a UTF-8 encoding problem.",
          severity: "warning",
          recommendation: "Re-export the source file as UTF-8.",
          count: mojibake,
        });
      }
      // near-duplicate categorical values (e.g. USA / U.S.A / United States → shared token)
      const inconsistentGroups = [...normGroups.values()].filter((g) => g.size > 1);
      if (col.type === "categorical" && inconsistentGroups.length > 0) {
        const affected = inconsistentGroups.reduce((s, g) => s + g.size, 0);
        issues.push({
          id: `inconsistent:${col.name}`,
          column: col.name,
          type: "inconsistent",
          title: `${inconsistentGroups.length} inconsistent value groups in "${col.name}"`,
          description: `Values like ${[...inconsistentGroups[0]]
            .slice(0, 3)
            .map((v) => `"${v}"`)
            .join(" / ")} appear to represent the same category.`,
          severity: "info",
          recommendation: "Standardize spelling and casing to a single canonical form.",
          op: { kind: "lowercase", column: col.name },
          count: affected,
        });
      }
      // numeric stored as text
      if (
        col.type === "text" &&
        nonNull >= 5 &&
        numericLike / nonNull > 0.9
      ) {
        issues.push({
          id: `numstr:${col.name}`,
          column: col.name,
          type: "numeric_as_text",
          title: `"${col.name}" looks numeric but is stored as text`,
          description: `${((numericLike / nonNull) * 100).toFixed(0)}% of values parse as numbers.`,
          severity: "info",
          recommendation: "Convert this column to a numeric type.",
          op: { kind: "convert_type", column: col.name, to: "float" },
          count: numericLike,
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
