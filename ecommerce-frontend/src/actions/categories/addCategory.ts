"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { categoryFormSchema } from "@/app/(dashboard)/categories/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CategoryServerActionResponse } from "@/types/server-action";

export async function addCategory(
  formData: FormData
): Promise<CategoryServerActionResponse> {
  const parsedData = categoryFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    slug: formData.get("slug"),
    status: formData.get("status"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...categoryData } = parsedData.data;

  const imageFile = formData.get("image") as File;
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return {
      validationErrors: {
        image: "Category image is required",
      },
    };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    const apiFormData = new FormData();
    apiFormData.append("name", categoryData.name);
    apiFormData.append("description", categoryData.description);
    apiFormData.append("slug", categoryData.slug);
    apiFormData.append("status", categoryData.status);;
    apiFormData.append("image", imageFile);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/categories/add-category`, {
      method: "POST",
      headers: {
        Cookie: `token=${token}`,
      },
      body: apiFormData,
    });

    const data = await response.json();


    if (!response.ok) {
      // Handle duplicate SKU error
      if (data.message && data.message.includes("SKU")) {
        return {
          validationErrors: {
            sku: "This product SKU is already assigned to an existing item. Please enter a different SKU.",
          },
        };
      }

      // Handle duplicate slug error
      if (data.message && data.message.includes("slug")) {
        return {
          validationErrors: {
            slug: "This product slug is already in use. Please choose a different one.",
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
          dbError: data.message || "Failed to create product. Please try again later.",
        };
      }

      return {
        dbError: "Something went wrong. Please try again later.",
      };
    }

    // Success - revalidate categories page
    revalidatePath("/categories");

    return { success: true, category: data.category };
  } catch (error) {
    console.error("Error adding category:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
