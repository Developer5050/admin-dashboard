"use server";

import { revalidatePath } from "next/cache";

// TODO: Replace with Node.js backend API calls
import { couponBulkFormSchema } from "@/app/(dashboard)/coupons/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { VServerActionResponse } from "@/types/server-action";

export async function editCoupons(
  couponIds: string[],
  formData: FormData
): Promise<VServerActionResponse> {
  const supabase = createServerActionClient();

  const parsedData = couponBulkFormSchema.safeParse({
    published: !!(formData.get("published") === "true"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { published } = parsedData.data;

  const { error: dbError } = await supabase
    .from("coupons")
    .update({ published })
    .in("id", couponIds);

  if (dbError) {
    console.error("Database update failed:", dbError);
    return { dbError: "Something went wrong. Please try again later." };
  }

  revalidatePath("/coupons");

  return { success: true };
}
