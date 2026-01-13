"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteContact(
  contactId: string
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
    const response = await fetch(
      `${apiUrl}/api/contacts/delete-contact/${contactId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: `token=${token}`,
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        dbError: data.message || "Something went wrong. Could not delete the contact.",
      };
    }

    revalidatePath("/contacts");

    return { success: true };
  } catch (error) {
    console.error("Delete contact error:", error);
    return {
      dbError: "Something went wrong. Could not delete the contact.",
    };
  }
}

