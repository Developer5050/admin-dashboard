// TODO: Replace all Supabase client calls with Node.js backend API calls

import {
  Category,
  CategoryDropdown,
  FetchCategoriesParams,
  FetchCategoriesResponse,
} from "./types";

export async function fetchCategories({
  page = 1,
  limit = 10,
  search,
}: FetchCategoriesParams): Promise<FetchCategoriesResponse> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const params = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   ...(search && { search }),
  // });
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/categories?${params}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch categories');
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

export async function fetchCategoriesDropdown(): Promise<CategoryDropdown[]> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/categories/dropdown`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch categories');
  // return await response.json();

  return [];
}
