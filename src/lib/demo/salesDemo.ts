export type DemoValue = string | number | null;
export type DemoRow = Record<string, DemoValue>;

export const DEMO_COLUMNS = [
  "Order Date",
  "Customer",
  "Region",
  "Product",
  "Quantity",
  "Price",
  "Revenue",
] as const;

export type DemoColumn = (typeof DEMO_COLUMNS)[number];

/** Intentionally messy sales extract used for the landing-page demo. */
export const DEMO_ROWS: DemoRow[] = [
  { "Order Date": "2024-01-04", Customer: "Hodan Yusuf", Region: "east", Product: "Laptop Stand", Quantity: 2, Price: "24.50", Revenue: 49 },
  { "Order Date": "2024-01-04", Customer: "Hodan Yusuf", Region: "east", Product: "Laptop Stand", Quantity: 2, Price: "24.50", Revenue: 49 },
  { "Order Date": "05/01/2024", Customer: " Liban Ahmed", Region: "EAST", Product: "USB-C Hub", Quantity: 1, Price: "38.00", Revenue: 38 },
  { "Order Date": "2024-01-07", Customer: "Sagal Warsame ", Region: "North", Product: "Monitor 27\"", Quantity: null, Price: "199.00", Revenue: null },
  { "Order Date": "2024-01-09", Customer: "Ayaan Farah", Region: "north", Product: "Desk Lamp", Quantity: 3, Price: "18.75", Revenue: 56.25 },
  { "Order Date": "2024-01-11", Customer: "", Region: "West", Product: "Keyboard", Quantity: 1, Price: "", Revenue: null },
  { "Order Date": "2024-01-12", Customer: "Mohamed Ali", Region: "west ", Product: " Keyboard", Quantity: 4, Price: "45.00", Revenue: 180 },
  { "Order Date": "2024-01-12", Customer: "Mohamed Ali", Region: "west ", Product: " Keyboard", Quantity: 4, Price: "45.00", Revenue: 180 },
  { "Order Date": "2024-01-15", Customer: "Deeqa Abdi", Region: "South", Product: "Monitor 27\"", Quantity: 1, Price: "199.00", Revenue: 199 },
  { "Order Date": "n/a", Customer: "Ismail Nur", Region: "SOUTH", Product: "USB-C Hub", Quantity: 2, Price: "38.00", Revenue: 76 },
  { "Order Date": "2024-01-18", Customer: "Fartun Osman", Region: "East", Product: "Desk Lamp", Quantity: 1, Price: "18.75", Revenue: 18.75 },
  { "Order Date": "2024-01-21", Customer: "Khadar Jama", Region: "", Product: "Laptop Stand", Quantity: 5, Price: "24.50", Revenue: 122.5 },
];

export type FlagKind = "missing" | "duplicate" | "whitespace" | "inconsistent" | "type";

export interface DemoIssue {
  kind: FlagKind;
  label: string;
  detail: string;
  count: number;
  unit: string;
}

const CATEGORY_COLUMNS: DemoColumn[] = ["Region", "Product"];

function isMissing(v: DemoValue) {
  return v === null || v === undefined || String(v).trim() === "" || String(v).trim().toLowerCase() === "n/a";
}

function hasWhitespace(v: DemoValue) {
  return typeof v === "string" && v !== "" && v !== v.trim();
}

/** Map of `rowIndex:column` -> set of flags. */
export function computeFlags(rows: DemoRow[]) {
  const flags = new Map<string, Set<FlagKind>>();
  const add = (r: number, c: string, k: FlagKind) => {
    const key = `${r}:${c}`;
    const set = flags.get(key) ?? new Set<FlagKind>();
    set.add(k);
    flags.set(key, set);
  };

  const seen = new Map<string, number>();
  rows.forEach((row, i) => {
    const sig = JSON.stringify(DEMO_COLUMNS.map((c) => row[c]));
    if (seen.has(sig)) DEMO_COLUMNS.forEach((c) => add(i, c, "duplicate"));
    else seen.set(sig, i);

    DEMO_COLUMNS.forEach((c) => {
      const v = row[c];
      if (isMissing(v)) add(i, c, "missing");
      if (hasWhitespace(v)) add(i, c, "whitespace");
      if (CATEGORY_COLUMNS.includes(c as DemoColumn) && typeof v === "string" && v.trim() !== "") {
        const norm = v.trim().toLowerCase();
        const canonical = v.trim();
        if (canonical !== canonical[0].toUpperCase() + canonical.slice(1).toLowerCase() && norm.length > 0) {
          add(i, c, "inconsistent");
        }
      }
      if (c === "Price" && typeof v === "string" && v.trim() !== "") add(i, c, "type");
      if (c === "Order Date" && typeof v === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(v) && !isMissing(v)) add(i, c, "type");
    });
  });

  return flags;
}

export function countFlag(flags: Map<string, Set<FlagKind>>, kind: FlagKind) {
  let n = 0;
  flags.forEach((set) => {
    if (set.has(kind)) n++;
  });
  return n;
}

export function duplicateRowCount(rows: DemoRow[]) {
  const seen = new Set<string>();
  let n = 0;
  rows.forEach((row) => {
    const sig = JSON.stringify(DEMO_COLUMNS.map((c) => row[c]));
    if (seen.has(sig)) n++;
    else seen.add(sig);
  });
  return n;
}

function titleCase(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (m) => m.toUpperCase());
}

function normalizeDate(v: DemoValue): DemoValue {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

/** Deterministic cleaned version of the demo dataset. */
export function cleanDemo(rows: DemoRow[]): DemoRow[] {
  const seen = new Set<string>();
  const out: DemoRow[] = [];

  for (const row of rows) {
    const sig = JSON.stringify(DEMO_COLUMNS.map((c) => row[c]));
    if (seen.has(sig)) continue;
    seen.add(sig);

    const next: DemoRow = {};
    for (const c of DEMO_COLUMNS) {
      let v = row[c];
      if (typeof v === "string") v = v.trim();
      if (c === "Order Date") v = normalizeDate(v);
      if (c === "Region" || c === "Product") v = typeof v === "string" && v ? titleCase(v) : v;
      if (c === "Price") v = v === "" || v === null ? null : Number(v);
      if (c === "Customer" && (v === "" || v === null)) v = "Unknown";
      next[c] = v as DemoValue;
    }

    // Impute the remaining gaps from known values.
    if (next.Quantity === null) next.Quantity = 2;
    if (next.Price === null) next.Price = 45;
    if (next["Order Date"] === null) next["Order Date"] = "2024-01-16";
    const qty = Number(next.Quantity);
    const price = Number(next.Price);
    next.Revenue = Number.isFinite(qty * price) ? Math.round(qty * price * 100) / 100 : next.Revenue;

    out.push(next);
  }

  return out;
}

export function demoIssues(rows: DemoRow[]): DemoIssue[] {
  const flags = computeFlags(rows);
  return [
    {
      kind: "missing",
      label: "Missing values",
      detail: "Empty cells and placeholder text like “n/a” that break aggregations.",
      count: countFlag(flags, "missing"),
      unit: "cells",
    },
    {
      kind: "duplicate",
      label: "Duplicate rows",
      detail: "Identical orders recorded more than once, inflating revenue totals.",
      count: duplicateRowCount(rows),
      unit: "rows",
    },
    {
      kind: "whitespace",
      label: "Whitespace issues",
      detail: "Leading or trailing spaces that split otherwise identical values.",
      count: countFlag(flags, "whitespace"),
      unit: "values",
    },
    {
      kind: "inconsistent",
      label: "Inconsistent values",
      detail: "The same category written as “east”, “EAST” and “East”.",
      count: countFlag(flags, "inconsistent"),
      unit: "values",
    },
    {
      kind: "type",
      label: "Type issues",
      detail: "Numbers stored as text and dates in mixed formats.",
      count: countFlag(flags, "type"),
      unit: "cells",
    },
  ];
}

export const DEMO_TYPES: Record<DemoColumn, string> = {
  "Order Date": "date",
  Customer: "text",
  Region: "category",
  Product: "category",
  Quantity: "integer",
  Price: "number",
  Revenue: "number",
};
