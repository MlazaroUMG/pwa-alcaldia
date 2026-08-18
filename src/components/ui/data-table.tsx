import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  isLoading?: boolean
  emptyMessage?: string
  errorMessage?: string | null
}

/**
 * Reusable data table with a global search box and pagination controls,
 * adapted from the shadcn-admin reference dashboard pattern.
 *
 * Column definitions and row actions stay entirely with the caller; this
 * component only owns search/pagination UI state so it can be reused across
 * admin listings without duplicating that logic.
 *
 * @component
 * @module UI
 * @param {DataTableProps<TData, TValue>} props Columns, rows, and display state.
 * @returns {JSX.Element} Searchable, paginated table.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  isLoading = false,
  emptyMessage = "No hay resultados.",
  errorMessage = null,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <div className="w-full min-w-0 space-y-4">
      <Input
        placeholder={searchPlaceholder}
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="w-full min-w-0 overflow-x-auto rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-6 text-center text-muted-foreground">
                  Cargando incidencias...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && errorMessage && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-6 text-center text-destructive">
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !errorMessage && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-6 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !errorMessage &&
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
