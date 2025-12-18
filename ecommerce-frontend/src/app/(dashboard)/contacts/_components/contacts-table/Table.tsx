"use client";

import * as React from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import DataTable from "@/components/shared/table/DataTable";
import { DataTableProps } from "@/types/data-table";
import { Contact } from "@/services/contacts/types";

export default function ContactsTable({
  data,
  columns,
  pagination,
}: DataTableProps<Contact>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} pagination={pagination} />;
}

