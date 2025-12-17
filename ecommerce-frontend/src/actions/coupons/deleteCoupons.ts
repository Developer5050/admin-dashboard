"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { ServerActionResponse } from "@/types/server-action";

export async function deleteCoupons(
  couponIds: string[]
): Promise<ServerActionResponse> {
  try {
    // Validate input
    if (!Array.isArray(couponIds) || couponIds.length === 0) {
      return { dbError: "Coupon IDs are required." };
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/coupons/bulk-delete-coupons`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ ids: couponIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (data.message && data.message.includes("required")) {
        return {
          dbError: data.message || "Coupon IDs are required.",
        };
      }

      return {
        dbError: data.message || "Something went wrong. Could not delete the coupons.",
      };
    }

    revalidatePath("/coupons");

    return { success: true };
  } catch (error) {
    console.error("Delete coupons error:", error);
    return {
      dbError: "Something went wrong. Could not delete the coupons.",
    };
  }
}
