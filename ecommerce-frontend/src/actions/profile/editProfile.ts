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

  // Handle image - convert File to base64 if it's a new file
  let imageUrl: string | undefined = undefined;

  if (image instanceof File && image.size > 0) {
    // Convert file to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = image.type;
    imageUrl = `data:${mimeType};base64,${base64Image}`;
  } else if (typeof image === "string" && image) {
    // If it's already a URL string, use it
    imageUrl = image;
  }

  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Prepare update data
    const updateData: { name: string; phone?: string | null; image_url?: string | null } = {
      name: profileData.name,
    };

    if (profileData.phone !== undefined) {
      updateData.phone = profileData.phone || null;
    }

    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl || null;
    }

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
      body: JSON.stringify(updateData),
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
