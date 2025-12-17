"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { couponFormSchema } from "@/app/(dashboard)/coupons/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { getImageUrl } from "@/helpers/getImageUrl";
import { CouponServerActionResponse } from "@/types/server-action";

export async function addCoupon(
  formData: FormData
): Promise<CouponServerActionResponse> {
  const parsedData = couponFormSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    image: formData.get("image"),
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

  // Validate that image is a File (required for new coupons)
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return {
      validationErrors: {
        image: "Coupon image is required",
      },
    };
  }

  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Prepare FormData for backend API
    const apiFormData = new FormData();
    apiFormData.append("name", parsedData.data.name);
    apiFormData.append("code", parsedData.data.code);
    apiFormData.append("startDate", parsedData.data.startDate.toISOString());
    apiFormData.append("endDate", parsedData.data.endDate.toISOString());
    apiFormData.append("isPercentageDiscount", String(parsedData.data.isPercentageDiscount));
    apiFormData.append("discountValue", String(parsedData.data.discountValue));
    apiFormData.append("image", image);

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/coupons/add-coupon`, {
      method: "POST",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
      body: apiFormData,
    });

    const data = await response.json();

    if (!response.ok) {
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
        if (data.message.includes("required")) {
          return {
            dbError: data.message || "Validation failed. Please check all required fields.",
          };
        }
        return {
          dbError: data.message || "Failed to create coupon. Please try again later.",
        };
      }

      return {
        dbError: "Something went wrong. Please try again later.",
      };
    }

    // Success - revalidate coupons page
    revalidatePath("/coupons");

    // Transform backend coupon to frontend format
    const backendCoupon = data.coupon;
    const discountType = backendCoupon.isPercentageDiscount ? "percentage" : "fixed";
    const imagePath = backendCoupon.image || "";

    const transformedCoupon = {
      id: backendCoupon._id?.toString() || backendCoupon.id?.toString() || "",
      campaign_name: backendCoupon.name || "",
      code: backendCoupon.code || "",
      image_url: getImageUrl(imagePath),
      discount_type: discountType,
      discount_value: backendCoupon.discountValue ?? backendCoupon.discount_value ?? 0,
      start_date: backendCoupon.startDate || backendCoupon.start_date || new Date().toISOString(),
      end_date: backendCoupon.endDate || backendCoupon.end_date || new Date().toISOString(),
      published: backendCoupon.published !== undefined ? backendCoupon.published : false,
      created_at: backendCoupon.createdAt || backendCoupon.created_at || new Date().toISOString(),
      updated_at: backendCoupon.updatedAt || backendCoupon.updated_at || new Date().toISOString(),
    };

    return {
      success: true,
      coupon: transformedCoupon as any,
    };
  } catch (error) {
    console.error("Add coupon error:", error);
    return {
      dbError: "Something went wrong. Please try again later.",
    };
  }
}
