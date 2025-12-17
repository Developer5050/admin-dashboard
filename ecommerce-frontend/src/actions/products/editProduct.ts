"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { productFormSchema } from "@/app/(dashboard)/products/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { ProductServerActionResponse } from "@/types/server-action";

export async function editProduct(
  productId: string,
  formData: FormData
): Promise<ProductServerActionResponse> {
  // Get image value - handle empty string, null, or undefined
  const imageValue = formData.get("image");
  const processedImage = imageValue && imageValue !== "" ? imageValue : undefined;

  const parsedData = productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    image: processedImage, // Use processed image value
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

  const { image, ...productData } = parsedData.data;

  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    // Prepare FormData for backend API
    const apiFormData = new FormData();
    apiFormData.append("name", productData.name);
    apiFormData.append("description", productData.description);
    apiFormData.append("sku", productData.sku);
    apiFormData.append("category", productData.category);
    apiFormData.append("costPrice", String(productData.costPrice));
    apiFormData.append("salesPrice", String(productData.salesPrice));
    apiFormData.append("quantity", String(productData.stock)); // Backend expects "quantity"
    apiFormData.append("minStockThreshold", String(productData.minStockThreshold));
    apiFormData.append("slug", productData.slug);
    if (productData.status) {
      apiFormData.append("status", productData.status);
    }
    // Image is optional for edit - only append if a new file is provided
    if (image instanceof File && image.size > 0) {
      apiFormData.append("image", image);
    }

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/products/edit-product/${productId}`, {
      method: "PUT",
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
        return {
          dbError: data.message || "Something went wrong. Please try again later.",
        };
      }

      return {
        dbError: "Something went wrong. Please try again later.",
      };
    }

    revalidatePath("/products");
    if (data.product?.slug) {
      revalidatePath(`/products/${data.product.slug}`);
    }

    return { success: true, product: data.product as any };
  } catch (error) {
    console.error("Edit product error:", error);
    return {
      dbError: "Something went wrong. Please try again later.",
    };
  }
}
