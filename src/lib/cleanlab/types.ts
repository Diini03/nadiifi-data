export type CellValue = string | number | boolean | null;

export type ColumnType =
  | "integer"
  | "float"
  | "boolean"
  | "date"
  | "email"
  | "phone"
  | "url"
  | "categorical"
  | "text";

export interface ColumnStats {
  missing: number;
  missingPct: number;
  unique: number;
  mode: CellValue;
  top: Array<{ value: CellValue; count: number }>;
  // numeric only
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  q1?: number;
  q3?: number;
  histogram?: Array<{ bin: string; count: number; x?: number }>;
  outliersIQR?: number;
  outliersZ?: number;
}

export interface Column {
  name: string;
  type: ColumnType;
  stats: ColumnStats;
}

export interface Dataset {
  id: string;
  name: string;
  fileSize: number;
  createdAt: number;
  updatedAt: number;
  rows: Record<string, CellValue>[];
  columns: Column[];
  favorite?: boolean;
  pinned?: boolean;
}

export type IssueSeverity = "critical" | "warning" | "info";

export interface Issue {
  id: string;
  column?: string;
  type: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  recommendation: string;
  op?: Operation;
  count?: number;
}

export type Operation =
  | { kind: "remove_duplicates" }
  | { kind: "drop_null_rows"; column?: string }
  | { kind: "fill_null"; column: string; strategy: "mean" | "median" | "mode" | "constant"; value?: CellValue }
  | { kind: "rename_column"; column: string; to: string }
  | { kind: "drop_column"; column: string }
  | { kind: "trim"; column: string }
  | { kind: "lowercase"; column: string }
  | { kind: "uppercase"; column: string }
  | { kind: "titlecase"; column: string }
  | { kind: "convert_type"; column: string; to: ColumnType }
  | { kind: "replace"; column: string; find: string; replace: string }
  | { kind: "remove_extra_spaces"; column: string }
  | { kind: "parse_date"; column: string }
  | { kind: "remove_outliers"; column: string; method: "iqr" | "zscore" }
  | { kind: "drop_empty_rows" }
  | { kind: "drop_empty_columns" }
  | { kind: "drop_duplicate_columns" };

export interface HistoryEntry {
  id: string;
  operation: Operation;
  label: string;
  timestamp: number;
  rowsBefore: number;
  rowsAfter: number;
}

export interface ExportEntry {
  id: string;
  datasetId: string;
  datasetName: string;
  format: "csv" | "xlsx" | "json" | "pdf";
  timestamp: number;
}
