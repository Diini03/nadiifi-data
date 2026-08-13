import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { CellValue } from "./types";

export async function parseFile(file: File): Promise<Record<string, CellValue>[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    return parseCSV(file);
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseXLSX(file);
  }
  if (name.endsWith(".json") || name.endsWith(".ndjson")) {
    return parseJSON(file);
  }
  // fallback try csv
  return parseCSV(file);
}

function parseCSV(file: File): Promise<Record<string, CellValue>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, CellValue>>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => resolve(results.data as Record<string, CellValue>[]),
      error: (err) => reject(err),
    });
  });
}

async function parseXLSX(file: File): Promise<Record<string, CellValue>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, CellValue>>(sheet, { defval: null, raw: true });
  return rows;
}

function flattenValue(v: unknown): CellValue {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") return JSON.stringify(v);
  return v as CellValue;
}

function toRows(input: unknown): Record<string, CellValue>[] {
  let list: unknown[] = [];
  if (Array.isArray(input)) list = input;
  else if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const arrayKey = Object.keys(obj).find((k) => Array.isArray(obj[k]));
    list = arrayKey ? (obj[arrayKey] as unknown[]) : [obj];
  }
  return list
    .filter((r) => r && typeof r === "object" && !Array.isArray(r))
    .map((r) => {
      const out: Record<string, CellValue> = {};
      for (const [k, v] of Object.entries(r as Record<string, unknown>)) {
        out[k.trim()] = flattenValue(v);
      }
      return out;
    });
}

async function parseJSON(file: File): Promise<Record<string, CellValue>[]> {
  const text = (await file.text()).trim();
  if (!text) return [];
  try {
    return toRows(JSON.parse(text));
  } catch {
    // newline-delimited JSON
    const rows = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    if (rows.length === 0) throw new Error("Invalid JSON file");
    return toRows(rows);
  }
}
