import { getImageUrl } from "@/helpers/getImageUrl";
import { Coupon, FetchCouponsParams, FetchCouponsResponse } from "./types";

export async function fetchCoupons({
  page = 1,
  limit = 10,
  search,
}: FetchCouponsParams): Promise<FetchCouponsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/coupons/get-all-coupons?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to fetch coupons");
    }

    const backendData = await response.json();

    if (!backendData.success) {
      throw new Error(backendData.message || "Failed to fetch coupons");
    }

    const backendCoupons = backendData.data || [];
    const transformedCoupons: Coupon[] = backendCoupons.map((coupon: any) => {
      const discountType = coupon.isPercentageDiscount ? "percentage" : "fixed";
      
      const imagePath = coupon.image || "";
      
      return {
        id: coupon._id?.toString() || coupon.id?.toString() || "",
        campaign_name: coupon.name || "",
        code: coupon.code || "",
        image_url: getImageUrl(imagePath),
        discount_type: discountType,
        discount_value: coupon.discountValue ?? coupon.discount_value ?? 0,
        start_date: coupon.startDate || coupon.start_date || new Date().toISOString(),
        end_date: coupon.endDate || coupon.end_date || new Date().toISOString(),
        published: coupon.published !== undefined ? coupon.published : false,
        created_at: coupon.createdAt || coupon.created_at || new Date().toISOString(),
        updated_at: coupon.updatedAt || coupon.updated_at || new Date().toISOString(),
      } as Coupon;
    });

    // Transform pagination from backend format to frontend format
    const backendPagination = backendData.pagination || {};
    const totalItems = backendPagination.total || 0;
    const currentPage = backendPagination.page || page;
    const totalPages = backendPagination.totalPages || backendPagination.pages || 1;

    return {
      data: transformedCoupons,
      pagination: {
        limit: backendPagination.limit || limit,
        current: currentPage,
        items: totalItems,
        pages: totalPages,
        next: currentPage < totalPages ? currentPage + 1 : null,
        prev: currentPage > 1 ? currentPage - 1 : null,
      },
    };
  } catch (error: any) {
    console.error("fetchCoupons Error:", error.message);
    throw error;
  }
}
