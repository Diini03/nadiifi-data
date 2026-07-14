import type { CellValue, ColumnType } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s\d]{7,}$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}([T\s]\d{2}:\d{2}(:\d{2})?)?/;
const DATE_SLASH_RE = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/;

export function isNullish(v: CellValue): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t === "" || t === "na" || t === "n/a" || t === "null" || t === "none" || t === "nan";
  }
  if (typeof v === "number") return Number.isNaN(v);
  return false;
}

export function coerceNumber(v: CellValue): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const cleaned = v.replace(/[,\s$]/g, "");
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function inferType(values: CellValue[]): ColumnType {
  const sample = values.filter((v) => !isNullish(v)).slice(0, 500);
  if (sample.length === 0) return "text";

  let numeric = 0;
  let integer = 0;
  let boolean = 0;
  let date = 0;
  let email = 0;
  let phone = 0;
  let url = 0;

  for (const v of sample) {
    if (typeof v === "boolean") { boolean++; continue; }
    const s = String(v).trim();
    const low = s.toLowerCase();
    if (low === "true" || low === "false" || low === "yes" || low === "no") { boolean++; continue; }
    if (EMAIL_RE.test(s)) { email++; continue; }
    if (URL_RE.test(s)) { url++; continue; }
    if (DATE_ISO_RE.test(s) || DATE_SLASH_RE.test(s)) {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime())) { date++; continue; }
    }
    const n = coerceNumber(s);
    if (n !== null) {
      numeric++;
      if (Number.isInteger(n)) integer++;
      continue;
    }
    if (PHONE_RE.test(s) && /\d{4,}/.test(s)) { phone++; }
  }

  const n = sample.length;
  const ratio = (x: number) => x / n;

  if (ratio(email) > 0.8) return "email";
  if (ratio(url) > 0.8) return "url";
  if (ratio(date) > 0.8) return "date";
  if (ratio(boolean) > 0.8) return "boolean";
  if (ratio(numeric) > 0.85) return integer / numeric > 0.9 ? "integer" : "float";
  if (ratio(phone) > 0.7) return "phone";

  const unique = new Set(sample.map((v) => String(v))).size;
  if (unique / n < 0.2 && unique < 50) return "categorical";
  return "text";
}
