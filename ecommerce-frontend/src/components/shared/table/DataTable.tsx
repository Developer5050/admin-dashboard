"use client";

import * as React from "react";
import { Table as TableType, flexRender } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Typography from "@/components/ui/typography";
import { Pagination as PaginationType } from "@/types/pagination";
import { useUpdateQueryString } from "@/hooks/use-update-query-string";
import { getPaginationButtons } from "@/helpers/getPaginationButtons";

interface DataTableProps<TData> {
  table: TableType<TData>;
  pagination: PaginationType;
}

export default function DataTable<TData>({
  table,
  pagination,
}: DataTableProps<TData>) {
  const updateQueryString = useUpdateQueryString({ scroll: false });
  
  // Provide default pagination values to prevent errors
  const safePagination = pagination || {
    limit: 10,
    current: 1,
    items: 0,
    pages: 0,
    next: null,
    prev: null,
  };

  const paginationButtons = getPaginationButtons({
    totalPages: safePagination.pages,
    currentPage: safePagination.current,
  });

  const handlePaginationButton = (page: number) => {
    updateQueryString("page", page.toString());
  };

  const handlePaginationPrev = () => {
    if (safePagination.prev) {
      updateQueryString("page", safePagination.prev.toString());
    }
  };

  const handlePaginationNext = () => {
    if (safePagination.next) {
      updateQueryString("page", safePagination.next.toString());
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      {/* data table */}
      <Table>
        <TableHeader className="bg-popover">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="uppercase whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-transparent"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.options.columns.length}
                className="h-32 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* pagination */}
      {safePagination.items > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 p-4 bg-popover text-muted-foreground">
          <Typography className="text-sm flex-shrink-0 uppercase font-medium">
            Showing{" "}
            {Math.max((safePagination.current - 1) * safePagination.limit + 1, 1)} to{" "}
            {Math.min(safePagination.current * safePagination.limit, safePagination.items)}{" "}
            of {safePagination.items}
          </Typography>

          <Pagination>
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePaginationPrev}
                  disabled={!safePagination.prev}
                />
              </PaginationItem>

              {paginationButtons.map((page, index) => (
                <PaginationItem key={`page-${index}`}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePaginationButton(page)}
                      isActive={page === safePagination.current}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={handlePaginationNext}
                  disabled={!safePagination.next}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
