// TODO: Replace all Supabase client calls with Node.js backend API calls

import {
  Contact,
  FetchContactsParams,
  FetchContactsResponse,
} from "./types";

export async function fetchContacts({
  page = 1,
  limit = 10,
  search,
}: FetchContactsParams): Promise<FetchContactsResponse> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const params = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   ...(search && { search }),
  // });
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/contacts?${params}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch contacts');
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

