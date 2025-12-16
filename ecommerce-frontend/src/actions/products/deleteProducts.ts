"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// TODO: Replace with Node.js backend API calls
import { ServerActionResponse } from "@/types/server-action";

export async function deleteProducts(
  productIds: string[]
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
    const response = await fetch(`${apiUrl}/api/products/bulk-delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ productIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        dbError: data.message || "Something went wrong. Could not delete the products.",
      };
    }

    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Delete products error:", error);
    return {
      dbError: "Something went wrong. Could not delete the products.",
    };
  }
}
