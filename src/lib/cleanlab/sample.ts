import type { CellValue } from "@/lib/cleanlab/types";

/**
 * Deliberately messy sample dataset with a bit of every issue the
 * inspection engine looks for: duplicates, missing values, whitespace,
 * inconsistent casing/spelling, invalid emails, numeric-stored-as-text,
 * empty rows, an empty column, and one duplicate column.
 */
export const SAMPLE_ROWS: Record<string, CellValue>[] = [
  { id: 1, id_copy: 1, name: "Ayaan Farah",   country: "Somalia",       age: "24", email: "ayaan@example.com",     phone: "+252 61 1234567", signup_date: "2024-01-15", notes: "" },
  { id: 2, id_copy: 2, name: "Mohamed Ali ",  country: "somalia",       age: "31", email: "mo.ali@example",         phone: "+252611234568",   signup_date: "2024/02/03", notes: null },
  { id: 3, id_copy: 3, name: "  Sagal H.",    country: "SOMALIA",       age: "29", email: "SAGAL@Example.com",      phone: "0611234569",      signup_date: "2024-02-19", notes: "VIP" },
  { id: 4, id_copy: 4, name: "Ayaan Farah",   country: "Somalia",       age: "24", email: "ayaan@example.com",     phone: "+252 61 1234567", signup_date: "2024-01-15", notes: "" },
  { id: 5, id_copy: 5, name: "John Smith",    country: "USA",           age: "45", email: "john@smith.com",         phone: "+1 202-555-0142", signup_date: "2024-03-11", notes: "" },
  { id: 6, id_copy: 6, name: "Jane Doe",      country: "United States", age: "37", email: "jane@doe.com",           phone: "+1 202 555 0100", signup_date: "2024-03-12", notes: "" },
  { id: 7, id_copy: 7, name: "Ahmed K.",      country: "U.S.A",         age: "52", email: "ahmed@k",                phone: "not-a-phone",     signup_date: "invalid",    notes: "" },
  { id: 8, id_copy: 8, name: "Maryan  Yusuf", country: "Kenya",         age: "N/A", email: "maryan@example.com",   phone: "+254712345678",   signup_date: "2024-04-01", notes: "" },
  { id: 9, id_copy: 9, name: "",              country: "",              age: "",   email: "",                       phone: "",                signup_date: "",            notes: "" },
  { id: 10, id_copy: 10, name: "Deeqa A.",    country: "Kenya",         age: "27", email: "deeqa@example.com",     phone: "+254712345679",   signup_date: "2024-04-14", notes: "" },
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
  return new File([csv], "sample-messy-customers.csv", { type: "text/csv" });
}
