import type { CellValue } from "./types";
import { isNullish } from "./infer";

/**
 * Category canonicalisation.
 *
 * Real datasets encode the same category many ways: " male ", "M", "Male".
 * Charts that group on the raw string show four bars for two real groups, so
 * every aggregation and the cleaning engine share this normaliser.
 */

export function normalizeToken(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Families are only applied when every value in a column belongs to one. */
const FAMILIES: { name: string; map: Record<string, string> }[] = [
  {
    name: "gender",
    map: { m: "Male", male: "Male", man: "Male", men: "Male", f: "Female", female: "Female", woman: "Female", women: "Female" },
  },
  {
    name: "boolean",
    map: { y: "Yes", yes: "Yes", true: "Yes", t: "Yes", n: "No", no: "No", false: "No", f: "No" },
  },
  {
    name: "status",
    map: {
      active: "Active", enabled: "Active", inactive: "Inactive", disabled: "Inactive",
      pending: "Pending", complete: "Completed", completed: "Completed", done: "Completed",
      cancelled: "Cancelled", canceled: "Cancelled",
    },
  },
];

/**
 * Builds a raw-value → canonical-label map for one column.
 * Returns an empty map when nothing needs merging.
 */
export function buildCanonicalMap(values: Iterable<CellValue>): Map<string, string> {
  const counts = new Map<string, Map<string, number>>(); // token -> raw -> count
  const tokens = new Set<string>();

  for (const v of values) {
    if (isNullish(v)) continue;
    const raw = String(v).trim().replace(/\s+/g, " ");
    if (!raw) continue;
    const token = normalizeToken(raw);
    if (!token) continue;
    tokens.add(token);
    const bucket = counts.get(token) ?? new Map<string, number>();
    bucket.set(raw, (bucket.get(raw) ?? 0) + 1);
    counts.set(token, bucket);
  }

  const tokenList = [...tokens];
  const family =
    tokenList.length > 0 && tokenList.length <= 8
      ? FAMILIES.find((f) => tokenList.every((t) => t in f.map))
      : undefined;

  const out = new Map<string, string>();
  for (const [token, bucket] of counts) {
    let label: string;
    if (family) {
      label = family.map[token];
    } else {
      // Keep the most common written form, falling back to title case.
      const sorted = [...bucket.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const dominant = sorted[0][0];
      label = bucket.size > 1 && dominant === dominant.toLowerCase() ? titleCase(dominant) : dominant;
    }
    for (const raw of bucket.keys()) out.set(raw, label);
  }
  return out;
}

/** Canonical label for a single cell, using a prepared map. */
export function canonicalLabel(value: CellValue, map: Map<string, string>): string | null {
  if (isNullish(value)) return null;
  const raw = String(value).trim().replace(/\s+/g, " ");
  if (!raw) return null;
  return map.get(raw) ?? raw;
}

/** How many distinct raw spellings collapse into a smaller set of labels. */
export function canonicalMergeCount(map: Map<string, string>): number {
  const labels = new Set(map.values());
  return Math.max(0, map.size - labels.size);
}
