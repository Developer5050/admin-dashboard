"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { profileFormSchema } from "@/app/(dashboard)/edit-profile/_components/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { ProfileServerActionResponse } from "@/types/server-action";

export async function editProfile(
  userId: string,
  formData: FormData
): Promise<ProfileServerActionResponse> {
  // Validate form data
  const parsedData = profileFormSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    image: formData.get("image"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...profileData } = parsedData.data;

  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Create FormData to send file directly (not base64)
    const updateFormData = new FormData();
    updateFormData.append("name", profileData.name);
    
    if (profileData.phone !== undefined) {
      updateFormData.append("phone", profileData.phone || "");
    }

    // Handle image - send file directly if it's a new file, or send URL/empty string
    if (image instanceof File && image.size > 0) {
      // Send file directly - backend will save it and return URL
      updateFormData.append("image", image);
    } else if (typeof image === "string" && image) {
      // If it's already a URL string (existing image), send it as image_url
      // Only send if it's not a base64 string (to avoid storing base64)
      if (!image.startsWith('data:')) {
        updateFormData.append("image_url", image);
      }
    } else if (image === null || image === undefined || image === "") {
      // Clear image
      updateFormData.append("image_url", "");
    }

    // Call backend API with FormData
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/auth/update-profile`, {
      method: "PUT",
      headers: {
        Cookie: `token=${token}`,
        // Don't set Content-Type header - let browser set it with boundary for FormData
      },
      credentials: "include",
      body: updateFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        return {
          validationErrors: formatValidationErrors(data.errors),
        };
      }
      return {
        dbError: data.message || "Failed to update profile. Please try again later.",
      };
    }

    revalidatePath("/edit-profile");

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      dbError: "Something went wrong. Please try again later.",
    };
  }
}
