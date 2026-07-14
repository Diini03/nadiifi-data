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
