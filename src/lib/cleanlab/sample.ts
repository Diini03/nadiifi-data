import type { CellValue } from "@/lib/cleanlab/types";

/**
 * Realistic customer sales dataset, deliberately messy: duplicates, missing
 * values, whitespace, inconsistent capitalisation, invalid values, numbers
 * stored as text, an empty row and an empty column.
 */
export const SAMPLE_ROWS: Record<string, CellValue>[] = [
  { "Order Date": "2024-01-15", Customer: "Ayaan Farah",    Region: "Somalia",       Product: "Laptop",   Quantity: "2",  Price: "899.00",  Revenue: "1798.00", Notes: "" },
  { "Order Date": "2024/02/03", Customer: "Mohamed Ali ",   Region: "somalia",       Product: "Monitor",  Quantity: "1",  Price: "219.50",  Revenue: "219.50",  Notes: "" },
  { "Order Date": "2024-02-19", Customer: "  Sagal Hersi",  Region: " SOMALIA ",     Product: "laptop",   Quantity: "3",  Price: "899.00",  Revenue: "",        Notes: "" },
  { "Order Date": "2024-01-15", Customer: "Ayaan Farah",    Region: "Somalia",       Product: "Laptop",   Quantity: "2",  Price: "899.00",  Revenue: "1798.00", Notes: "" },
  { "Order Date": "2024-03-11", Customer: "John Smith",     Region: "USA",           Product: "Keyboard", Quantity: "5",  Price: "49.99",   Revenue: "249.95",  Notes: "" },
  { "Order Date": "2024-03-12", Customer: "Jane Doe",       Region: "United States", Product: "Monitor",  Quantity: "",   Price: "219.50",  Revenue: "",        Notes: "" },
  { "Order Date": "not a date", Customer: "Ahmed Kahin",    Region: "U.S.A",         Product: "MONITOR",  Quantity: "1",  Price: "219.50",  Revenue: "219.50",  Notes: "" },
  { "Order Date": "2024-04-01", Customer: "Maryan  Yusuf",  Region: "Kenya",         Product: "Desk",     Quantity: "1",  Price: "N/A",     Revenue: "",        Notes: "" },
  { "Order Date": "",           Customer: "",               Region: "",              Product: "",         Quantity: "",   Price: "",        Revenue: "",        Notes: "" },
  { "Order Date": "2024-04-14", Customer: "Deeqa Abdi",     Region: "kenya",         Product: "Chair",    Quantity: "4",  Price: "129.00",  Revenue: "516.00",  Notes: "" },
  { "Order Date": "2024-04-18", Customer: "Deeqa Abdi",     Region: "Kenya",         Product: "chair ",   Quantity: "2",  Price: "129.00",  Revenue: "258.00",  Notes: "" },
  { "Order Date": "2024-05-02", Customer: "Liban Warsame",  Region: "Somalia",       Product: "Laptop",   Quantity: "1",  Price: "899.00",  Revenue: "899.00",  Notes: "" },
  { "Order Date": "2024-05-09", Customer: "Hodan Nur",      Region: "Djibouti",      Product: "Keyboard", Quantity: "10", Price: "49.99",   Revenue: "499.90",  Notes: "" },
  { "Order Date": "2024-05-09", Customer: "Hodan Nur",      Region: "Djibouti",      Product: "Keyboard", Quantity: "10", Price: "49.99",   Revenue: "499.90",  Notes: "" },
  { "Order Date": "2024-06-01", Customer: "Sagal Hersi",    Region: "SOMALIA",       Product: "Desk",     Quantity: "1",  Price: "349.00",  Revenue: "349.00",  Notes: "" },
  { "Order Date": "2024-06-14", Customer: "John Smith",     Region: "usa",           Product: "Monitor",  Quantity: "2",  Price: "219.50",  Revenue: "439.00",  Notes: "" },
  { "Order Date": "2024-06-22", Customer: "Amina Osman",    Region: "Kenya",         Product: "Laptop",   Quantity: "1",  Price: "899.00",  Revenue: "899.00",  Notes: "" },
  { "Order Date": "2024-07-03", Customer: "Amina Osman",    Region: "Kenya ",        Product: "Chair",    Quantity: "6",  Price: "129.00",  Revenue: "774.00",  Notes: "" },
  { "Order Date": "2024-07-19", Customer: "Yasin Abdulle",  Region: "Djibouti",      Product: "Desk",     Quantity: "1",  Price: "349.00",  Revenue: "349.00",  Notes: "" },
  { "Order Date": "2024-08-05", Customer: "Ifrah Said",     Region: "Somalia",       Product: "Monitor",  Quantity: "3",  Price: "219.50",  Revenue: "9999999", Notes: "" },
];

export function buildSampleFile(): File {
  const headers = Object.keys(SAMPLE_ROWS[0]);
  const csv = [
    headers.join(","),
    ...SAMPLE_ROWS.map((r) =>
      headers
        .map((h) => {
          const v = r[h];
          if (v === null || v === undefined) return "";
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    ),
  ].join("\n");
  return new File([csv], "sample-sales.csv", { type: "text/csv" });
}
