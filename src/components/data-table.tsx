import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T> = {
  key: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  // custom cell; defaults to item[key]
  cell?: (item: T, index: number) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  items: T[];
  getRowKey?: (item: T, index: number) => string | number;
  isRowActive?: (item: T) => boolean;
  isRowDisabled?: (item: T) => boolean;
  className?: string;
};

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function DataTable<T>({
  columns,
  items,
  getRowKey = (_, i) => i,
  isRowActive,
  isRowDisabled,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-background", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-10 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  alignClass[col.align ?? "left"],
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => {
            const disabled = isRowDisabled?.(item);
            return (
              <TableRow
                key={getRowKey(item, i)}
                data-state={isRowActive?.(item) ? "selected" : undefined}
                aria-disabled={disabled || undefined}
                className="hover:bg-muted-subtle/40 data-[state=selected]:bg-primary-subtle aria-disabled:text-muted-foreground"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("h-16 px-4", alignClass[col.align ?? "left"], col.className)}
                  >
                    {col.cell
                      ? col.cell(item, i)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
