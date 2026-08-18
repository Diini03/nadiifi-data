import type { CellValue } from "@/lib/cleanlab/types";

/**
 * Realistic retail sales dataset for the demo. Deliberately messy (duplicates,
 * missing values, whitespace, inconsistent capitalisation, invalid values,
 * numbers stored as text, an empty row and an empty column) but shaped for
 * good visuals: a date axis, two categorical dimensions and three numeric
 * measures so every chart type has something meaningful to show.
 */
type Row = Record<string, CellValue>;

const r = (
  date: string,
  region: string,
  category: string,
  product: string,
  qty: string,
  price: string,
  revenue: string,
): Row => ({
  "Order Date": date,
  Region: region,
  Category: category,
  Product: product,
  Quantity: qty,
  "Unit Price": price,
  Revenue: revenue,
  Notes: "",
});

export const SAMPLE_ROWS: Row[] = [
  r("2024-01-08", "Somalia", "Hardware", "Laptop", "2", "899.00", "1798.00"),
  r("2024-01-15", "Kenya", "Accessories", "Keyboard", "5", "49.99", "249.95"),
  r("2024-01-22", "Somalia", "Hardware", "Monitor", "1", "219.50", "219.50"),
  r("2024-01-22", "Somalia", "Hardware", "Monitor", "1", "219.50", "219.50"),
  r("2024-02-03", "somalia", "Furniture", "Desk", "1", "349.00", "349.00"),
  r("2024-02-11", "Djibouti", "Accessories", "Mouse", "8", "24.00", "192.00"),
  r("2024-02-19", " SOMALIA ", "Hardware", "laptop", "3", "899.00", ""),
  r("2024-02-26", "Kenya", "Furniture", "Chair", "4", "129.00", "516.00"),
  r("2024-03-04", "Ethiopia", "Hardware", "Laptop", "1", "899.00", "899.00"),
  r("2024-03-11", "USA", "Accessories", "Keyboard", "5", "49.99", "249.95"),
  r("2024-03-12", "United States", "Hardware", "Monitor", "", "219.50", ""),
  r("2024-03-20", "Kenya ", "Furniture", "Chair", "6", "129.00", "774.00"),
  r("not a date", "U.S.A", "Hardware", "MONITOR", "1", "219.50", "219.50"),
  r("2024-04-01", "Kenya", "Furniture", "Desk", "1", "N/A", ""),
  r("", "", "", "", "", "", ""),
  r("2024-04-09", "Djibouti", "Accessories", "Headset", "7", "79.00", "553.00"),
  r("2024-04-14", "kenya", "Furniture", "Chair", "4", "129.00", "516.00"),
  r("2024-04-18", "Kenya", "Furniture", "chair ", "2", "129.00", "258.00"),
  r("2024-04-25", "Ethiopia", "Accessories", "Mouse", "12", "24.00", "288.00"),
  r("2024-05-02", "Somalia", "Hardware", "Laptop", "1", "899.00", "899.00"),
  r("2024-05-09", "Djibouti", "Accessories", "Keyboard", "10", "49.99", "499.90"),
  r("2024-05-09", "Djibouti", "Accessories", "Keyboard", "10", "49.99", "499.90"),
  r("2024-05-17", "USA", "Hardware", "Monitor", "2", "219.50", "439.00"),
  r("2024-05-24", "Somalia", "Furniture", "Desk", "2", "349.00", "698.00"),
  r("2024-06-01", "SOMALIA", "Hardware", "Server", "1", "2450.00", "2450.00"),
  r("2024-06-08", "Kenya", "Accessories", "Headset", "5", "79.00", "395.00"),
  r("2024-06-14", "usa", "Hardware", "Monitor", "2", "219.50", "439.00"),
  r("2024-06-22", "Kenya", "Hardware", "Laptop", "1", "899.00", "899.00"),
  r("2024-06-29", "Ethiopia", "Furniture", "Chair", "9", "129.00", "1161.00"),
  r("2024-07-03", "Kenya", "Furniture", "Chair", "6", "129.00", "774.00"),
  r("2024-07-12", "Djibouti", "Hardware", "Laptop", "2", "899.00", "1798.00"),
  r("2024-07-19", "Djibouti", "Furniture", "Desk", "1", "349.00", "349.00"),
  r("2024-07-27", "Somalia", "Accessories", "Mouse", "15", "24.00", "360.00"),
  r("2024-08-05", "Somalia", "Hardware", "Monitor", "3", "219.50", "9999999"),
  r("2024-08-13", "USA", "Hardware", "Server", "1", "2450.00", "2450.00"),
  r("2024-08-21", "Ethiopia", "Accessories", "Keyboard", "6", "49.99", "299.94"),
  r("2024-09-02", "Kenya", "Hardware", "Laptop", "4", "899.00", "3596.00"),
  r("2024-09-10", "Somalia", "Furniture", "Chair", "3", "129.00", "387.00"),
  r("2024-09-18", "Djibouti", "Accessories", "Headset", "4", "79.00", "316.00"),
  r("2024-09-27", "Kenya", "Hardware", "Monitor", "5", "219.50", "1097.50"),
  r("2024-10-04", "USA", "Furniture", "Desk", "3", "349.00", "1047.00"),
  r("2024-10-15", "Somalia", "Accessories", "Mouse", "20", "24.00", "480.00"),
  r("2024-10-23", "Ethiopia", "Hardware", "Laptop", "2", "899.00", "1798.00"),
  r("2024-11-01", "Kenya", "Accessories", "Keyboard", "9", "49.99", "449.91"),
  r("2024-11-12", "Djibouti", "Hardware", "Monitor", "4", "219.50", "878.00"),
  r("2024-11-20", "Somalia", "Furniture", "Desk", "2", "349.00", "698.00"),
  r("2024-12-02", "Kenya", "Hardware", "Server", "1", "2450.00", "2450.00"),
  r("2024-12-11", "USA", "Accessories", "Headset", "8", "79.00", "632.00"),
  r("2024-12-19", "Ethiopia", "Furniture", "Chair", "7", "129.00", "903.00"),
  r("2024-12-27", "Somalia", "Hardware", "Laptop", "3", "899.00", "2697.00"),
];

export function buildSampleFile(): File {
  const headers = Object.keys(SAMPLE_ROWS[0]);
  const csv = [
    headers.join(","),
    ...SAMPLE_ROWS.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          if (v === null || v === undefined) return "";
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    ),
  ].join("\n");
  return new File([csv], "sample-retail-sales.csv", { type: "text/csv" });
}
