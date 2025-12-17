import axiosInstance from "@/helpers/axiosInstance";
import { getImageUrl } from "@/helpers/getImageUrl";
import {
  Product,
  FetchProductsParams,
  FetchProductsResponse,
  ProductDetails,
} from "./types";

export async function fetchProducts({
  page = 1,
  limit = 10,
  search,
  category,
  priceSort,
  status,
  published,
  dateSort,
}: FetchProductsParams): Promise<FetchProductsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(category && { category }),
    ...(priceSort && { priceSort }),
    ...(status && { status }),
    ...(published !== undefined && { published: published.toString() }),
    ...(dateSort && { dateSort }),
  });

  const response = await axiosInstance.get(
    `/api/products/get-all-products?${params.toString()}`
  );

  const backendData = response.data;
  
  // Transform backend products to frontend format
  // Always transform to ensure image URLs are processed correctly
  const backendProducts = backendData.products || backendData.data || [];
  const transformedProducts = backendProducts.map((product: any) => {
    // Handle category - backend stores category as string (name or ID)
    const categoryValue = product.category || product.category_id || "";
    const categories = product.categories || (categoryValue ? {
      name: categoryValue,
      slug: null,
    } : null);

    // Handle image - backend may send image_url (already transformed) or image (raw path)
    const imagePath = product.image_url || product.image || "";
    
    return {
      id: product._id?.toString() || product.id?.toString() || "",
      name: product.name || "",
      description: product.description || "",
      image_url: getImageUrl(imagePath),
      sku: product.sku || "",
      // Handle both backend formats: costPrice (MongoDB) or cost_price (transformed)
      cost_price: product.cost_price ?? product.costPrice ?? 0,
      selling_price: product.selling_price ?? product.salesPrice ?? 0,
      stock: product.stock ?? product.quantity ?? 0,
      min_stock_threshold: product.min_stock_threshold ?? product.minStockThreshold ?? 0,
      category_id: categoryValue,
      slug: product.slug || "",
      published: product.published !== undefined ? product.published : true,
      status: product.status || "draft",
      created_at: product.created_at || product.createdAt || new Date().toISOString(),
      updated_at: product.updated_at || product.updatedAt || new Date().toISOString(),
      categories,
    };
  });

  // Use pagination from backend if available, otherwise calculate
  const totalItems = backendData.pagination?.items || backendData.count || transformedProducts.length;
  const totalPages = backendData.pagination?.pages || Math.ceil(totalItems / limit);

  return {
    data: transformedProducts,
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

export async function fetchProductDetails({ id }: { id: string }): Promise<{ product: ProductDetails }> {
  try {
    if (!id) {
      console.error("fetchProductDetails: No ID provided");
      throw new Error("Product ID is required");
    }

    // For server-side rendering, use fetch with cookies
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    const response = await fetch(`${apiUrl}/api/products/get-product/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Cookie: `token=${token}` }),
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error("Product not found");
      }
      console.error("API Error:", response.status, errorData);
      throw new Error(errorData?.message || "Failed to fetch product");
    }
        
    const data = await response.json();
    
    // Check if response is successful
    if (!data || !data.success) {
      console.error("fetchProductDetails: API returned unsuccessful response:", data);
      throw new Error("Product not found");
    }
    
    const backendProduct = data.product;
    
    if (!backendProduct) {
      console.error("fetchProductDetails: Product not found in response:", data);
      throw new Error("Product not found");
    }

    // Transform backend product to frontend format
    const categoryValue = backendProduct.category || "";
    const imagePath = backendProduct.image || backendProduct.image_url || "";
    
    const product: ProductDetails = {
      id: backendProduct._id || backendProduct.id,
      name: backendProduct.name || "",
      description: backendProduct.description || "",
      image_url: getImageUrl(imagePath),
      sku: backendProduct.sku || "",
      cost_price: backendProduct.costPrice ?? backendProduct.cost_price ?? 0,
      selling_price: backendProduct.salesPrice ?? backendProduct.selling_price ?? 0,
      stock: backendProduct.quantity ?? backendProduct.stock ?? 0,
      min_stock_threshold: backendProduct.minStockThreshold ?? backendProduct.min_stock_threshold ?? 0,
      category_id: categoryValue,
      slug: backendProduct.slug || "",
      status: backendProduct.status || "draft",
      categories: {
        name: categoryValue,
      },
    };

    return { product };
  } catch (error: any) {
    console.error("fetchProductDetails Error:", error.message);
    throw error;
  }
}
