// TODO: Replace all Supabase client calls with Node.js backend API calls

import { Coupon, FetchCouponsParams, FetchCouponsResponse } from "./types";

export async function fetchCoupons({
  page = 1,
  limit = 10,
  search,
}: FetchCouponsParams): Promise<FetchCouponsResponse> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const params = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   ...(search && { search }),
  // });
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/coupons?${params}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch coupons');
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
