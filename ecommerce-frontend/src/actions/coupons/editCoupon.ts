"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { couponFormSchema } from "@/app/(dashboard)/coupons/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { getImageUrl } from "@/helpers/getImageUrl";
import { CouponServerActionResponse } from "@/types/server-action";

export async function editCoupon(
  couponId: string,
  formData: FormData
): Promise<CouponServerActionResponse> {
  // Get image value - handle empty string, null, or undefined
  const imageValue = formData.get("image");
  const processedImage = imageValue && imageValue !== "" ? imageValue : undefined;

  const parsedData = couponFormSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    image: processedImage, // Use processed image value
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isPercentageDiscount: formData.get("isPercentageDiscount") === "true",
    discountValue: formData.get("discountValue"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...couponData } = parsedData.data;

  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Prepare FormData for backend API
    const apiFormData = new FormData();
    apiFormData.append("name", couponData.name);
    apiFormData.append("code", couponData.code);
    apiFormData.append("startDate", couponData.startDate.toISOString());
    apiFormData.append("endDate", couponData.endDate.toISOString());
    apiFormData.append("isPercentageDiscount", String(couponData.isPercentageDiscount));
    apiFormData.append("discountValue", String(couponData.discountValue));
    
    // Image is optional for edit - only append if a new file is provided
    if (image instanceof File && image.size > 0) {
      apiFormData.append("image", image);
    }

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/coupons/edit-coupon/${couponId}`, {
      method: "PUT",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
      body: apiFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle coupon not found error
      if (data.message && data.message.includes("not found")) {
        return {
          dbError: "Coupon not found. It may have already been deleted.",
        };
      }

      // Handle duplicate code error
      if (data.message && data.message.includes("code") && data.message.includes("already exists")) {
        return {
          validationErrors: {
            code: "This coupon code is already in use. Please create a unique code for your new coupon.",
          },
        };
      }

      // Handle validation errors from backend
      if (data.message) {
        return {
          dbError: data.message || "Something went wrong. Please try again later.",
        };
      }

      return {
        dbError: "Something went wrong. Please try again later.",
      };
    }

    // Success - revalidate coupons page
    revalidatePath("/coupons");

    // Transform backend coupon to frontend format
    const backendCoupon = data.data || data.coupon;
    const discountType = backendCoupon.isPercentageDiscount ? "percentage" : "fixed";
    const imagePath = backendCoupon.image || "";

    const transformedCoupon = {
      id: backendCoupon._id?.toString() || backendCoupon.id?.toString() || couponId,
      campaign_name: backendCoupon.name || couponData.name,
      code: backendCoupon.code || couponData.code,
      image_url: getImageUrl(imagePath),
      discount_type: discountType,
      discount_value: backendCoupon.discountValue ?? backendCoupon.discount_value ?? couponData.discountValue,
      start_date: backendCoupon.startDate || backendCoupon.start_date || couponData.startDate.toISOString(),
      end_date: backendCoupon.endDate || backendCoupon.end_date || couponData.endDate.toISOString(),
      published: backendCoupon.published !== undefined ? backendCoupon.published : false,
      created_at: backendCoupon.createdAt || backendCoupon.created_at || new Date().toISOString(),
      updated_at: backendCoupon.updatedAt || backendCoupon.updated_at || new Date().toISOString(),
    };

    return {
      success: true,
      coupon: transformedCoupon as any,
    };
  } catch (error) {
    console.error("Edit coupon error:", error);
    return {
      dbError: "Something went wrong. Please try again later.",
    };
  }
}
