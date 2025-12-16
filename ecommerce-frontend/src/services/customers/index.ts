// TODO: Replace all Supabase client calls with Node.js backend API calls

import {
  Customer,
  FetchCustomersParams,
  FetchCustomersResponse,
  CustomerOrder,
} from "./types";

export async function fetchCustomers({
  page = 1,
  limit = 10,
  search,
}: FetchCustomersParams): Promise<FetchCustomersResponse> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const params = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   ...(search && { search }),
  // });
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/customers?${params}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch customers');
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

export async function fetchCustomerOrders({ id }: { id: string }): Promise<{ customerOrders: CustomerOrder[] }> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${id}/orders`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch customer orders');
  // const data = await response.json();
  // return { customerOrders: data };

  throw new Error("Backend not configured. Please set up Node.js backend.");
}
