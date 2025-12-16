"use server";

import { revalidatePath } from "next/cache";

// TODO: Replace with Node.js backend API calls
import { ServerActionResponse } from "@/types/server-action";
import { OrderStatus } from "@/services/orders/types";

export async function changeOrderStatus(
  orderId: string,
  newOrderStatus: OrderStatus
): Promise<ServerActionResponse> {
  const supabase = createServerActionClient();

  const { error: dbError } = await supabase
    .from("orders")
    .update({ status: newOrderStatus })
    .eq("id", orderId);

  if (dbError) {
    console.error("Database update failed:", dbError);
    return { dbError: "Failed to update order status." };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);

  return { success: true };
}
