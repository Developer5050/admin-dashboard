"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import InvoicesTable from "./Table";
import { getColumns, skeletonColumns } from "./columns";
import TableSkeleton from "@/components/shared/table/TableSkeleton";
import TableError from "@/components/shared/table/TableError";

import { getSearchParams } from "@/helpers/getSearchParams";
import { fetchOrders } from "@/services/orders";
import { useAuthorization } from "@/hooks/use-authorization";

export default function AllInvoices() {
  const { hasPermission } = useAuthorization();
  const columns = getColumns({ hasPermission });
  const { page, limit, search, method, startDate, endDate } =
    getSearchParams(useSearchParams());

  const {
    data: invoices,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "invoices",
      page,
      limit,
      search,
      method,
      startDate,
      endDate,
    ],
    queryFn: () =>
      fetchOrders({
        page,
        limit,
        search,
        method,
        startDate,
        endDate,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0, // Disable cache so data always fetches fresh
  });

  if (isLoading || (isFetching && !invoices))
    return <TableSkeleton perPage={limit} columns={skeletonColumns} />;

  if (isError || !invoices)
    return (
      <TableError
        errorMessage="Something went wrong while trying to fetch invoices."
        refetch={refetch}
      />
    );

  return (
    <InvoicesTable
      columns={columns}
      data={invoices.data}
      pagination={invoices.pagination}
    />
  );
}
