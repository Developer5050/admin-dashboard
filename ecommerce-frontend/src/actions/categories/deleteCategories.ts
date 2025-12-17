"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCategories(
  categoryIds: string[]
): Promise<ServerActionResponse> {
  try {
    if (!categoryIds || categoryIds.length === 0) {
      return {
        dbError: "Please select at least one category to delete.",
      };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/categories/bulk-delete-categories`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({ ids: categoryIds }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (data.message) {
        if (data.message.includes("provide an array")) {
          return {
            dbError: "Invalid request. Please select categories to delete.",
          };
        }
        if (data.message.includes("not found")) {
          return {
            dbError: "Some categories were not found. Please refresh and try again.",
          };
        }
        return {
          dbError: data.message || "Failed to delete categories. Please try again later.",
        };
      }

      return {
        dbError: "Something went wrong. Please try again later.",
      };
    }

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    console.error("Error deleting categories:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
