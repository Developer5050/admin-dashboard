"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCategory(
  categoryId: string
): Promise<ServerActionResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/categories/delete-category/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        dbError: data.message || "Failed to delete category. Please try again later.",
      };
    }

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
