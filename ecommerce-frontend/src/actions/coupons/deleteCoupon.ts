"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { ServerActionResponse } from "@/types/server-action";

export async function deleteCoupon(
  couponId: string
): Promise<ServerActionResponse> {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/coupons/delete-coupon/${couponId}`, {
      method: "DELETE",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle coupon not found error
      if (data.message && data.message.includes("not found")) {
        return {
          dbError: "Coupon not found. It may have already been deleted.",
        };
      }

      return {
        dbError: data.message || "Something went wrong. Could not delete the coupon.",
      };
    }

    revalidatePath("/coupons");

    return { success: true };
  } catch (error) {
    console.error("Delete coupon error:", error);
    return {
      dbError: "Something went wrong. Could not delete the coupon.",
    };
  }
}
