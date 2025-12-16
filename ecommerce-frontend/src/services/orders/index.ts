// TODO: Replace all Supabase client calls with Node.js backend API calls

import {
  Order,
  FetchOrdersParams,
  FetchOrdersResponse,
  OrderDetails,
} from "./types";

export async function fetchOrders({
  page = 1,
  limit = 10,
  search,
  status,
  method,
  startDate,
  endDate,
}: FetchOrdersParams): Promise<FetchOrdersResponse> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const params = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   ...(search && { search }),
  //   ...(status && { status }),
  //   ...(method && { method }),
  //   ...(startDate && { startDate }),
  //   ...(endDate && { endDate }),
  // });
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/orders?${params}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch orders');
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

export async function fetchOrderDetails({ id }: { id: string }): Promise<{ order: OrderDetails }> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch order details');
  // const data = await response.json();
  // return { order: data };

  throw new Error("Backend not configured. Please set up Node.js backend.");
}
