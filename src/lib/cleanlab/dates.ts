import type { CellValue } from "./types";
import { isNullish } from "./infer";

const MONTHS: Record<string, number> = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12 };
const pad = (n: number) => String(n).padStart(2, "0");
function iso(y: number, m: number, d: number): string | null {
  if (y < 100) y += y < 50 ? 2000 : 1900;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

export type DateFormat = "iso" | "slash" | "text" | "serial" | "other";

export function dateFormatOf(v: CellValue): DateFormat | null {
  if (isNullish(v)) return null;
  const s = String(v).trim();
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(s)) return "iso";
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(s)) return "slash";
  if (/[a-z]{3,}/i.test(s) && Object.keys(MONTHS).some((m) => s.toLowerCase().includes(m)) && /\d/.test(s)) return "text";
  if (typeof v === "number" && v > 20000 && v < 80000) return "serial";
  return null;
}

/** Decide day-first vs month-first from the values themselves. */
export function detectDayFirst(values: CellValue[]): boolean {
  let dayFirst = 0, monthFirst = 0;
  for (const v of values) {
    const m = /^(\d{1,2})[-/.](\d{1,2})[-/.]\d{2,4}$/.exec(String(v ?? "").trim());
    if (!m) continue;
    if (+m[1] > 12) dayFirst++;
    else if (+m[2] > 12) monthFirst++;
  }
  return dayFirst > monthFirst;
}

export function parseDateSmart(v: CellValue, dayFirst: boolean): string | null {
  if (isNullish(v)) return null;
  const s = String(v).trim();
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(s);
  if (m) {
    let a = +m[1], b = +m[2];
    if (a > 12) dayFirst = true; else if (b > 12) dayFirst = false;
    return dayFirst ? iso(+m[3], b, a) : iso(+m[3], a, b);
  }
  m = /^(\d{1,2})(?:st|nd|rd|th)?[\s\-/.,]+([a-z]+)[\s\-/.,]+(\d{2,4})$/i.exec(s);
  if (m && MONTHS[m[2].slice(0, 3).toLowerCase()])
    return iso(+m[3], MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]);
  m = /^([a-z]+)[\s\-/.]+(\d{1,2})(?:st|nd|rd|th)?,?[\s\-/.]+(\d{2,4})$/i.exec(s);
  if (m && MONTHS[m[1].slice(0, 3).toLowerCase()]) return iso(+m[3], MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]);
  if (typeof v === "number" && v > 20000 && v < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return d.toISOString().slice(0, 10);
  }
  return null;
}
