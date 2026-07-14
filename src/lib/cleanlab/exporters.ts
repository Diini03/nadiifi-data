import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Dataset } from "./types";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(ds: Dataset) {
  const csv = Papa.unparse(ds.rows);
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${ds.name}.csv`);
}

export function exportJSON(ds: Dataset) {
  const json = JSON.stringify(ds.rows, null, 2);
  download(new Blob([json], { type: "application/json" }), `${ds.name}.json`);
}

export function exportXLSX(ds: Dataset) {
  const ws = XLSX.utils.json_to_sheet(ds.rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cleaned");
  XLSX.writeFile(wb, `${ds.name}.xlsx`);
}
