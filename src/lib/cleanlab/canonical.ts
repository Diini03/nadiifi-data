import type { CellValue } from "./types";
import { isNullish } from "./infer";

/**
 * Category canonicalisation.
 *
 * Real datasets encode the same category many ways: " male ", "M", "Male",
 * "Maale". Charts that group on the raw string show four bars for two real
 * groups, so every aggregation and the cleaning engine share this normaliser.
 *
 * Three passes, in order of confidence:
 *   1. token pass   — case / spacing / punctuation differences (always safe)
 *   2. family pass  — known vocabularies (gender, yes-no, status)
 *   3. fuzzy pass   — short codes that prefix a full label ("M" -> "Male") and
 *                     rare misspellings within one edit of a dominant label
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
    map: {
      m: "Male", male: "Male", man: "Male", men: "Male", boy: "Male",
      f: "Female", female: "Female", woman: "Female", women: "Female", girl: "Female",
    },
  },
  {
    name: "boolean",
    map: { y: "Yes", yes: "Yes", true: "Yes", t: "Yes", "1": "Yes", n: "No", no: "No", false: "No", f: "No", "0": "No" },
  },
  {
    name: "status",
    map: {
      active: "Active", enabled: "Active", inactive: "Inactive", disabled: "Inactive",
      pending: "Pending", complete: "Completed", completed: "Completed", done: "Completed",
      cancelled: "Cancelled", canceled: "Cancelled", shipped: "Shipped", delivered: "Delivered",
      returned: "Returned", refunded: "Refunded", paid: "Paid", unpaid: "Unpaid",
    },
  },
];

/** Levenshtein distance with an early exit once `max` is exceeded. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    let rowMin = prev[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diag = tmp;
      rowMin = Math.min(rowMin, prev[j]);
    }
    if (rowMin > max) return max + 1;
  }
  return prev[b.length];
}

/** Allowed typo distance for a label of this length. Short codes never fuzzy-match. */
function typoBudget(len: number): number {
  if (len >= 8) return 2;
  if (len >= 4) return 1;
  return 0;
}

/**
 * Builds a raw-value → canonical-label map for one column.
 * Returns an empty map when nothing needs merging.
 */
export function buildCanonicalMap(values: Iterable<CellValue>): Map<string, string> {
  const counts = new Map<string, Map<string, number>>(); // token -> raw -> count
  const tokenCount = new Map<string, number>();

  for (const v of values) {
    if (isNullish(v)) continue;
    const raw = String(v).trim().replace(/\s+/g, " ");
    if (!raw) continue;
    const token = normalizeToken(raw);
    if (!token) continue;
    const bucket = counts.get(token) ?? new Map<string, number>();
    bucket.set(raw, (bucket.get(raw) ?? 0) + 1);
    counts.set(token, bucket);
    tokenCount.set(token, (tokenCount.get(token) ?? 0) + 1);
  }

  const tokenList = [...tokenCount.keys()];
  const family =
    tokenList.length > 0 && tokenList.length <= 12
      ? FAMILIES.find((f) => tokenList.every((t) => t in f.map))
      : undefined;

  // --- pass 3: fuzzy merge of tokens onto dominant tokens -------------------
  // Only for columns that behave like categories (few distinct values).
  const alias = new Map<string, string>(); // token -> target token
  if (!family && tokenList.length > 1 && tokenList.length <= 40) {
    const ranked = [...tokenCount.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
    const resolve = (t: string): string => {
      let cur = t;
      for (let i = 0; i < 5 && alias.has(cur); i++) cur = alias.get(cur)!;
      return cur;
    };
    for (let i = ranked.length - 1; i >= 1; i--) {
      const [token, count] = ranked[i];
      if (alias.has(token)) continue;
      for (let j = 0; j < i; j++) {
        const [target, targetCount] = ranked[j];
        if (resolve(target) === token) continue;
        const short = token.length <= 3 && target.length > token.length;
        const prefixMatch = short && target.startsWith(token);
        const budget = Math.min(typoBudget(token.length), typoBudget(target.length));
        // a misspelling is rare relative to the correct spelling
        const typoMatch =
          budget > 0 && count <= targetCount * 0.4 && editDistance(token, target, budget) <= budget;
        // a plural/singular pair of the same word
        const pluralMatch =
          target === `${token}s` || token === `${target}s`;
        if (prefixMatch || typoMatch || pluralMatch) {
          alias.set(token, resolve(target));
          break;
        }
      }
    }
    // a short code must map to exactly one full label, otherwise drop it
    const prefixTargets = new Map<string, Set<string>>();
    for (const [t, target] of alias) {
      if (t.length <= 3 && target.startsWith(t)) {
        const set = prefixTargets.get(t) ?? new Set<string>();
        set.add(target);
        prefixTargets.set(t, set);
      }
    }
    for (const [t, set] of prefixTargets) if (set.size > 1) alias.delete(t);
  }

  // --- label selection ------------------------------------------------------
  const groups = new Map<string, Map<string, number>>(); // final token -> raw -> count
  for (const [token, bucket] of counts) {
    let target = token;
    for (let i = 0; i < 5 && alias.has(target); i++) target = alias.get(target)!;
    const g = groups.get(target) ?? new Map<string, number>();
    for (const [raw, n] of bucket) g.set(raw, (g.get(raw) ?? 0) + n);
    groups.set(target, g);
  }

  const out = new Map<string, string>();
  for (const [token, bucket] of groups) {
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

/** Groups of raw spellings that will be merged, for preview/explanation. */
export function canonicalGroups(map: Map<string, string>): { label: string; variants: string[] }[] {
  const byLabel = new Map<string, string[]>();
  for (const [raw, label] of map) {
    const list = byLabel.get(label) ?? [];
    list.push(raw);
    byLabel.set(label, list);
  }
  return [...byLabel.entries()]
    .filter(([label, variants]) => variants.length > 1 || variants[0] !== label)
    .map(([label, variants]) => ({ label, variants: variants.sort() }));
}
