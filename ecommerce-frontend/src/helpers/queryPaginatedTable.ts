// TODO: This helper was used for Supabase pagination
// Replace with API calls to your Node.js backend
// The backend should handle pagination and return the same structure

import { Pagination } from "@/types/pagination";

type Response<TableData> = {
  data: TableData[];
  pagination: Pagination;
};

// This is a placeholder - replace with actual API implementation
export async function queryPaginatedTable<TableData>({
  page,
  limit,
  name,
  query,
}: {
  page: number;
  limit: number;
  name: string;
  query: any; // Remove Supabase query type
}): Promise<Response<TableData>> {
  // TODO: Replace with API call to your Node.js backend
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/${name}?page=${page}&limit=${limit}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error(`Error fetching ${name}`);
  // return await response.json();

  // Placeholder response
  return {
    data: [],
    pagination: {
      limit,
      current: page,
      items: 0,
      pages: 0,
      next: null,
      prev: null,
    },
  };
}
