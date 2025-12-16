"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { productFormSchema } from "@/app/(dashboard)/products/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { ProductServerActionResponse } from "@/types/server-action";

export async function addProduct(
  formData: FormData
): Promise<ProductServerActionResponse> {
  const parsedData = productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    image: formData.get("image"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    costPrice: formData.get("costPrice"),
    salesPrice: formData.get("salesPrice"),
    stock: formData.get("quantity") || formData.get("stock"), // Form sends "quantity"
    minStockThreshold: formData.get("minStockThreshold"),
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

  // Validate that image is a File (required for new products)
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return {
      validationErrors: {
        image: "Product image is required",
      },
    };
  }

  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Prepare FormData for backend API
    // Note: The form already maps 'stock' to 'quantity' in FormData
    // We need to ensure all required fields are present
    const apiFormData = new FormData();
    apiFormData.append("name", parsedData.data.name);
    apiFormData.append("description", parsedData.data.description);
    apiFormData.append("sku", parsedData.data.sku);
    apiFormData.append("category", parsedData.data.category);
    apiFormData.append("costPrice", String(parsedData.data.costPrice));
    apiFormData.append("salesPrice", String(parsedData.data.salesPrice));
    apiFormData.append("quantity", String(parsedData.data.stock));
    apiFormData.append("minStockThreshold", String(parsedData.data.minStockThreshold));
    apiFormData.append("slug", parsedData.data.slug);
    apiFormData.append("status", parsedData.data.status || "draft");
    apiFormData.append("image", image);

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/products/add-product`, {
      method: "POST",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
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

    // Success - revalidate products page
    revalidatePath("/products");

    return {
      success: true,
      product: data.product as any, // Type assertion needed due to structure mismatch
    };
  } catch (error) {
    console.error("Add product error:", error);
    return {
      dbError: "Something went wrong. Please try again later.",
    };
  }
}
