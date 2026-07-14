import type { CellValue, Dataset, Operation } from "./types";
import { coerceNumber, isNullish } from "./infer";
import { reprofile } from "./profile";

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function applyOperation(ds: Dataset, op: Operation): Dataset {
  let rows = ds.rows.map((r) => ({ ...r }));

  switch (op.kind) {
    case "remove_duplicates": {
      const seen = new Set<string>();
      rows = rows.filter((r) => {
        const k = JSON.stringify(r);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      break;
    }
    case "drop_null_rows": {
      rows = rows.filter((r) => {
        if (op.column) return !isNullish(r[op.column]);
        return Object.values(r).every((v) => !isNullish(v));
      });
      break;
    }
    case "fill_null": {
      const col = ds.columns.find((c) => c.name === op.column);
      let fillValue: CellValue = op.value ?? "";
      if (op.strategy === "mean" && col?.stats.mean !== undefined) fillValue = col.stats.mean;
      else if (op.strategy === "median" && col?.stats.median !== undefined) fillValue = col.stats.median;
      else if (op.strategy === "mode") fillValue = col?.stats.mode ?? "";
      rows = rows.map((r) => (isNullish(r[op.column]) ? { ...r, [op.column]: fillValue } : r));
      break;
    }
    case "rename_column": {
      rows = rows.map((r) => {
        const { [op.column]: v, ...rest } = r;
        return { ...rest, [op.to]: v };
      });
      break;
    }
    case "drop_column": {
      rows = rows.map((r) => {
        const { [op.column]: _drop, ...rest } = r;
        return rest;
      });
      break;
    }
    case "trim": {
      rows = rows.map((r) => {
        const v = r[op.column];
        return typeof v === "string" ? { ...r, [op.column]: v.trim() } : r;
      });
      break;
    }
    case "lowercase":
    case "uppercase":
    case "titlecase": {
      const fn =
        op.kind === "lowercase"
          ? (s: string) => s.toLowerCase()
          : op.kind === "uppercase"
          ? (s: string) => s.toUpperCase()
          : titleCase;
      rows = rows.map((r) => {
        const v = r[op.column];
        return typeof v === "string" ? { ...r, [op.column]: fn(v) } : r;
      });
      break;
    }
    case "remove_extra_spaces": {
      rows = rows.map((r) => {
        const v = r[op.column];
        return typeof v === "string" ? { ...r, [op.column]: v.trim().replace(/\s+/g, " ") } : r;
      });
      break;
    }
    case "replace": {
      rows = rows.map((r) => {
        const v = r[op.column];
        return typeof v === "string" ? { ...r, [op.column]: v.split(op.find).join(op.replace) } : r;
      });
      break;
    }
    case "parse_date": {
      rows = rows.map((r) => {
        const v = r[op.column];
        if (v == null) return r;
        const d = new Date(String(v));
        return Number.isNaN(d.getTime())
          ? r
          : { ...r, [op.column]: d.toISOString().slice(0, 10) };
      });
      break;
    }
    case "convert_type": {
      rows = rows.map((r) => {
        const v = r[op.column];
        if (isNullish(v)) return r;
        if (op.to === "integer" || op.to === "float") {
          const n = coerceNumber(v);
          return n === null ? r : { ...r, [op.column]: op.to === "integer" ? Math.trunc(n) : n };
        }
        if (op.to === "boolean") {
          const s = String(v).toLowerCase();
          const b = s === "true" || s === "yes" || s === "1";
          return { ...r, [op.column]: b };
        }
        return { ...r, [op.column]: String(v) };
      });
      break;
    }
    case "remove_outliers": {
      const col = ds.columns.find((c) => c.name === op.column);
      if (!col) break;
      if (op.method === "iqr" && col.stats.q1 !== undefined && col.stats.q3 !== undefined) {
        const iqr = col.stats.q3 - col.stats.q1;
        const lo = col.stats.q1 - 1.5 * iqr;
        const hi = col.stats.q3 + 1.5 * iqr;
        rows = rows.filter((r) => {
          const n = coerceNumber(r[op.column]);
          return n === null || (n >= lo && n <= hi);
        });
      } else if (op.method === "zscore" && col.stats.mean !== undefined && col.stats.std) {
        const mean = col.stats.mean;
        const std = col.stats.std;
        rows = rows.filter((r) => {
          const n = coerceNumber(r[op.column]);
          return n === null || Math.abs((n - mean) / std) <= 3;
        });
      }
      break;
    }
  }

  return reprofile({ ...ds, rows });
}

export function operationLabel(op: Operation): string {
  switch (op.kind) {
    case "remove_duplicates": return "Remove duplicate rows";
    case "drop_null_rows": return op.column ? `Drop null rows in ${op.column}` : "Drop rows with any null";
    case "fill_null": return `Fill nulls in ${op.column} (${op.strategy})`;
    case "rename_column": return `Rename ${op.column} → ${op.to}`;
    case "drop_column": return `Drop column ${op.column}`;
    case "trim": return `Trim ${op.column}`;
    case "lowercase": return `Lowercase ${op.column}`;
    case "uppercase": return `Uppercase ${op.column}`;
    case "titlecase": return `Title-case ${op.column}`;
    case "convert_type": return `Convert ${op.column} → ${op.to}`;
    case "replace": return `Replace in ${op.column}`;
    case "remove_extra_spaces": return `Collapse spaces in ${op.column}`;
    case "parse_date": return `Parse dates in ${op.column}`;
    case "remove_outliers": return `Remove ${op.method.toUpperCase()} outliers in ${op.column}`;
  }
}
