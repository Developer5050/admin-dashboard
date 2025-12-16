"use server";

import { revalidatePath } from "next/cache";

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
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...categoryData } = parsedData.data;

  let imageUrl: string | undefined;

  // TODO: Replace Supabase storage with Node.js backend file upload
  // Example:
  // if (image instanceof File && image.size > 0) {
  //   const uploadFormData = new FormData();
  //   uploadFormData.append('file', image);
  //   uploadFormData.append('folder', 'categories');
  //   uploadFormData.append('slug', parsedData.data.slug);
  //   
  //   const uploadResponse = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
  //     {
  //       method: 'POST',
  //       body: uploadFormData,
  //       credentials: 'include',
  //     }
  //   );
  //   
  //   if (!uploadResponse.ok) {
  //     return { validationErrors: { image: "Failed to upload image" } };
  //   }
  //   
  //   const uploadData = await uploadResponse.json();
  //   imageUrl = uploadData.url;
  // }

  // TODO: Replace Supabase database insert with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
  //   {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       ...categoryData,
  //       image_url: imageUrl,
  //       published: false,
  //     }),
  //     credentials: 'include',
  //   }
  // );
  // 
  // if (!response.ok) {
  //   const error = await response.json();
  //   if (error.code === 'DUPLICATE_SLUG') {
  //     return {
  //       validationErrors: {
  //         slug: "This category slug is already in use. Please choose a different one.",
  //       },
  //     };
  //   }
  //   if (error.code === 'DUPLICATE_NAME') {
  //     return {
  //       validationErrors: {
  //         name: "A category with this name already exists. Please enter a unique name for this category.",
  //       },
  //     };
  //   }
  //   return { dbError: "Something went wrong. Please try again later." };
  // }
  // 
  // const newCategory = await response.json();
  // revalidatePath("/categories");
  // return { success: true, category: newCategory };

  // Placeholder response
  return { dbError: "Backend not configured. Please set up Node.js backend." };
}
