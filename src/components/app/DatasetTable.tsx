import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { CellValue, Column, Dataset } from "@/lib/cleanlab/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { isNullish } from "@/lib/cleanlab/infer";

interface DatasetTableProps {
  dataset: Dataset;
  onColumnClick?: (col: Column) => void;
  pageSize?: number;
}

const typeTone: Record<string, string> = {
  integer: "bg-info/10 text-info",
  float: "bg-info/10 text-info",
  boolean: "bg-primary-soft text-primary",
  date: "bg-warning/10 text-warning",
  email: "bg-success/10 text-success",
  phone: "bg-success/10 text-success",
  url: "bg-success/10 text-success",
  categorical: "bg-accent text-accent-foreground",
  text: "bg-muted text-muted-foreground",
};

export function DatasetTable({ dataset, onColumnClick, pageSize = 20 }: DatasetTableProps) {
  const [query, setQuery] = useState("");

  const columns = useMemo<ColumnDef<Record<string, CellValue>>[]>(
    () =>
      dataset.columns.map((col) => ({
        accessorKey: col.name,
        header: () => (
          <button
            onClick={() => onColumnClick?.(col)}
            className="flex flex-col items-start gap-1 py-1 text-left hover:text-primary"
          >
            <span className="font-medium">{col.name}</span>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] uppercase ${typeTone[col.type] ?? ""}`}>
              {col.type}
            </span>
          </button>
        ),
        cell: ({ getValue }) => {
          const v = getValue() as CellValue;
          if (isNullish(v))
            return <span className="italic text-muted-foreground/60">null</span>;
          if (typeof v === "boolean") return <Badge variant="outline">{String(v)}</Badge>;
          return <span className="block max-w-[240px] truncate">{String(v)}</span>;
        },
      })),
    [dataset.columns, onColumnClick],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return dataset.rows;
    const q = query.toLowerCase();
    return dataset.rows.filter((r) =>
      Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(q)),
    );
  }, [dataset.rows, query]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rows…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} rows
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={dataset.columns.length} className="h-24 text-center text-muted-foreground">
                    No rows match.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
