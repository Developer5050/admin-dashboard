// "use server";

// import { revalidatePath } from "next/cache";

// // TODO: Replace with Node.js backend API calls
// import { ServerActionResponse } from "@/types/server-action";
// import { cookies } from "next/headers";

// export async function toggleCategoryPublishedStatus(
//   categoryId: string,
//   currentPublishedStatus: boolean
// ): Promise<ServerActionResponse> {
//   // const supabase = createServerActionClient();
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;

//   if (!token) {
//     return { dbError: "Authentication required. Please login again." };
//   }

//   const newPublishedStatus = !currentPublishedStatus;

//   const { error: dbError } = await fetch(`${apiUrl}/api/categories/toggle-category-status/${categoryId}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       Cookie: `token=${token}`,
//     },
//     body: JSON.stringify({ status: newStatus }),
//   });
//     .from("categories")
//     .update({ published: newPublishedStatus })
//     .eq("id", categoryId);

//   if (dbError) {
//     console.error("Database update failed:", dbError);
//     return { dbError: "Failed to update category status." };
//   }

//   revalidatePath("/categories");

//   return { success: true };
// }
