"use client"

import { useState, useEffect } from "react" // Added useEffect
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
  type TableState, // Added TableState
  type PaginationState, // Added PaginationState
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: string
  searchPlaceholder?: string
  // Added props for server-side control
  manualPagination?: boolean
  manualFiltering?: boolean
  manualSorting?: boolean
  pageCount?: number // Total number of pages
  state?: Partial<TableState> // Current state (pagination, sorting, filters)
  onPaginationChange?: (updater: any) => void // Callback for pagination changes
  onSortingChange?: (updater: any) => void // Callback for sorting changes
  onColumnFiltersChange?: (updater: any) => void // Callback for column filter changes
  onSearchChange?: (value: string) => void // Callback for search input changes
  loading?: boolean // Loading state
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Tìm kiếm...",
  manualPagination = false,
  manualFiltering = false,
  manualSorting = false,
  pageCount = -1, // -1 means unknown page count
  state,
  onPaginationChange,
  onSortingChange,
  onSearchChange,
  onColumnFiltersChange, // Added onColumnFiltersChange here
  loading = false,
}: DataTableProps<TData, TValue>) {
  // Internal state for client-side operations if not manual
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Use internal state if manual control is not enabled
  const sorting = manualSorting && state?.sorting !== undefined ? state.sorting : internalSorting;
  const columnFilters = manualFiltering && state?.columnFilters !== undefined ? state.columnFilters : internalColumnFilters;
  const pagination = manualPagination && state?.pagination !== undefined ? state.pagination : internalPagination;


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Conditionally enable client-side pagination/filtering/sorting
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    // Use external callbacks if manual control is enabled, otherwise use internal setters
    onSortingChange: manualSorting ? onSortingChange : setInternalSorting,
    onColumnFiltersChange: manualFiltering ? onColumnFiltersChange : setInternalColumnFilters,
    onPaginationChange: manualPagination ? onPaginationChange : setInternalPagination,
    // Pass external state if manual control is enabled, otherwise use internal state
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination,
    manualFiltering,
    manualSorting,
    pageCount: manualPagination ? pageCount : undefined, // Pass pageCount only in manual pagination
  })

  // Handle search input change
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (manualFiltering && onSearchChange) {
      onSearchChange(value);
    } else if (searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value);
    }
  };

  // Get current search value
  const currentSearchValue =
    manualFiltering && state?.columnFilters
      ? (state.columnFilters.find((f: any) => f.id === searchColumn)?.value as string ?? "")
      : (searchColumn && table.getColumn(searchColumn)
          ? (table.getColumn(searchColumn)?.getFilterValue() as string ?? "")
          : "");


  return (
    <div className="space-y-4">
      {searchColumn && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={currentSearchValue}
              onChange={handleSearchInputChange}
              className="pl-8"
            />
          </div>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Trang {table.getState().pagination.pageIndex + 1} / {manualPagination ? pageCount : table.getPageCount()}
          </p>
           <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
