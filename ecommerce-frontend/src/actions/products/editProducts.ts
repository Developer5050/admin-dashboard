"use server";

import { revalidatePath } from "next/cache";

// TODO: Replace with Node.js backend API calls
import { productBulkFormSchema } from "@/app/(dashboard)/products/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { VServerActionResponse } from "@/types/server-action";

export async function editProducts(
  productIds: string[],
  formData: FormData
): Promise<VServerActionResponse> {
  const parsedData = productBulkFormSchema.safeParse({
    category:
      formData.get("category") === "" ? undefined : formData.get("category"),
    published:
      formData.get("published") === null
        ? undefined
        : !!(formData.get("published") === "true"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { category, published } = parsedData.data;

  // TODO: Implement Node.js backend API call
  // Example:
  // const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // const response = await fetch(`${apiUrl}/api/products/bulk-update`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   credentials: "include",
  //   body: JSON.stringify({
  //     productIds,
  //     category,
  //     published,
  //   }),
  // });
  // if (!response.ok) {
  //   const data = await response.json();
  //   return { dbError: data.message || "Something went wrong. Please try again later." };
  // }

  revalidatePath("/products");

  return { success: true };
}
