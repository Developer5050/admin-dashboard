"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { categoryFormSchema } from "@/app/(dashboard)/categories/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CategoryServerActionResponse } from "@/types/server-action";

export async function editCategory(
  categoryId: string,
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
    apiFormData.append("status", categoryData.status);

    // Only append image if it's a new file (not a URL string)
    if (image instanceof File && image.size > 0) {
      apiFormData.append("image", image);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/categories/edit-category/${categoryId}`,
      {
        method: "PUT",
        headers: {
          Cookie: `token=${token}`,
        },
        body: apiFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle duplicate slug error
      if (data.message && data.message.includes("slug")) {
        return {
          validationErrors: {
            slug: "This category slug is already in use. Please choose a different one.",
          },
        };
      }

      // Handle duplicate name error
      if (data.message && data.message.includes("name")) {
        return {
          validationErrors: {
            name: "A category with this name already exists. Please enter a unique name for this category.",
          },
        };
      }

      // Handle category not found
      if (response.status === 404) {
        return {
          dbError: "Category not found. Please refresh the page and try again.",
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
          dbError: data.message || "Failed to update category. Please try again later.",
        };
      }

      return {
        dbError: "Something went wrong. Please try again later.",
      };
    }

    // Transform backend response to match frontend format
    const transformedCategory = {
      id: data.category._id.toString(),
      name: data.category.name || "",
      description: data.category.description || "",
      image_url: data.category.image || "",
      slug: data.category.slug || "",
      status: data.category.status || "active",
      created_at: data.category.createdAt
        ? new Date(data.category.createdAt).toISOString()
        : new Date().toISOString(),
      updated_at: data.category.updatedAt
        ? new Date(data.category.updatedAt).toISOString()
        : new Date().toISOString(),
    };

    revalidatePath("/categories");

    return { success: true, category: transformedCategory };
  } catch (error) {
    console.error("Error editing category:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
