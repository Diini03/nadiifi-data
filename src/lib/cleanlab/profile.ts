import type { CellValue, Column, ColumnStats, ColumnType, Dataset } from "./types";
import { coerceNumber, inferType, isNullish } from "./infer";

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

export function computeStats(values: CellValue[], type: ColumnType): ColumnStats {
  const total = values.length;
  const nonNull = values.filter((v) => !isNullish(v));
  const missing = total - nonNull.length;

  const counts = new Map<string, number>();
  for (const v of nonNull) {
    const k = String(v);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value: value as CellValue, count }));

  const stats: ColumnStats = {
    missing,
    missingPct: total ? (missing / total) * 100 : 0,
    unique: counts.size,
    mode: top[0]?.value ?? null,
    top,
  };

  if (type === "integer" || type === "float") {
    const nums = nonNull.map(coerceNumber).filter((n): n is number => n !== null);
    if (nums.length > 0) {
      const sorted = [...nums].sort((a, b) => a - b);
      const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
      const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
      const std = Math.sqrt(variance);
      const q1 = quantile(sorted, 0.25);
      const q3 = quantile(sorted, 0.75);
      const iqr = q3 - q1;
      const lo = q1 - 1.5 * iqr;
      const hi = q3 + 1.5 * iqr;

      stats.min = sorted[0];
      stats.max = sorted[sorted.length - 1];
      stats.mean = mean;
      stats.median = quantile(sorted, 0.5);
      stats.std = std;
      stats.q1 = q1;
      stats.q3 = q3;
      stats.outliersIQR = nums.filter((n) => n < lo || n > hi).length;
      stats.outliersZ = std > 0 ? nums.filter((n) => Math.abs((n - mean) / std) > 3).length : 0;

      // histogram: 12 bins
      const bins = 12;
      const range = stats.max - stats.min || 1;
      const step = range / bins;
      const hist = Array.from({ length: bins }, (_, i) => ({
        bin: `${(stats.min! + i * step).toFixed(1)}`,
        x: stats.min! + i * step + step / 2,
        count: 0,
      }));
      for (const n of nums) {
        let idx = Math.floor((n - stats.min!) / step);
        if (idx >= bins) idx = bins - 1;
        if (idx < 0) idx = 0;
        hist[idx].count++;
      }
      stats.histogram = hist;
    }
  }

  return stats;
}

export function profileDataset(name: string, rows: Record<string, CellValue>[], size: number): Dataset {
  const columnNames = rows.length > 0 ? Object.keys(rows[0]) : [];
  const columns: Column[] = columnNames.map((colName) => {
    const values = rows.map((r) => r[colName]);
    const type = inferType(values);
    return { name: colName, type, stats: computeStats(values, type) };
  });

  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    fileSize: size,
    createdAt: now,
    updatedAt: now,
    rows,
    columns,
  };
}

export function reprofile(dataset: Dataset): Dataset {
  return {
    ...dataset,
    columns: dataset.columns.map((c) => {
      const values = dataset.rows.map((r) => r[c.name]);
      const type = inferType(values);
      return { name: c.name, type, stats: computeStats(values, type) };
    }),
    updatedAt: Date.now(),
  };
}
