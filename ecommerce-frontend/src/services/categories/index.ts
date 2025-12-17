import axiosInstance from "@/helpers/axiosInstance";
import { getImageUrl } from "@/helpers/getImageUrl";
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
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const response = await axiosInstance.get(
    `/api/categories/get-all-categories?${params.toString()}`
  );

  const backendData = response.data;
  
  // Transform backend categories to frontend format
  const backendCategories = backendData.data || [];
  const transformedCategories = backendCategories.map((category: any) => {
    // Handle image - backend may send image_url (already transformed) or image (raw path)
    const imagePath = category.image_url || category.image || "";
    
    return {
      id: category.id || category._id?.toString() || "",
      name: category.name || "",
      description: category.description || "",
      image_url: getImageUrl(imagePath),
      slug: category.slug || "",
      status: category.status || "active",
      created_at: category.created_at || category.createdAt || new Date().toISOString(),
      updated_at: category.updated_at || category.updatedAt || new Date().toISOString(),
    };
  });

  // Use pagination from backend if available, otherwise calculate
  const totalItems = backendData.pagination?.items || transformedCategories.length;
  const totalPages = backendData.pagination?.pages || Math.ceil(totalItems / limit);

  return {
    data: transformedCategories,
    pagination: backendData.pagination || {
      limit,
      current: page,
      items: totalItems,
      pages: totalPages,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    },
  };
}

export async function fetchCategoriesDropdown(): Promise<CategoryDropdown[]> {
  try {
    // Fetch all categories without pagination for dropdown
    const response = await axiosInstance.get(
      `/api/categories/get-all-categories?page=1&limit=1000`
    );

    const backendData = response.data;
    const backendCategories = backendData.data || [];
    
    // Transform to dropdown format (only id, name, slug)
    return backendCategories.map((category: any) => ({
      id: category.id || category._id?.toString() || "",
      name: category.name || "",
      slug: category.slug || "",
    }));
  } catch (error) {
    console.error("Error fetching categories dropdown:", error);
    return [];
  }
}
