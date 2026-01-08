"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import ContactsTable from "./Table";
import { getColumns, skeletonColumns } from "./columns";
import TableError from "@/components/shared/table/TableError";
import TableSkeleton from "@/components/shared/table/TableSkeleton";

import { getSearchParams } from "@/helpers/getSearchParams";
import { fetchContacts } from "@/services/contacts";
import { useAuthorization } from "@/hooks/use-authorization";

export default function AllContacts() {
  const { hasPermission } = useAuthorization();
  const columns = getColumns({ hasPermission });
  const { page, limit, search } = getSearchParams(useSearchParams());

  const {
    data: contacts,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["contacts", page, limit, search],
    queryFn: () =>
      fetchContacts({ page, limit, search }),
    placeholderData: keepPreviousData,
  });

  if (isLoading || (isFetching && !contacts))
    return <TableSkeleton perPage={limit || 10} columns={skeletonColumns} />;

  if (isError || !contacts)
    return (
      <TableError
        errorMessage="Something went wrong while trying to fetch contacts."
        refetch={refetch}
      />
    );

  return (
    <ContactsTable
      columns={columns}
      data={contacts.data}
      pagination={contacts.pagination}
    />
  );
}

