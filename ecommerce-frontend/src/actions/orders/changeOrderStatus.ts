"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { ServerActionResponse } from "@/types/server-action";
import { OrderStatus } from "@/services/orders/types";

export async function changeOrderStatus(
  orderId: string,
  newOrderStatus: OrderStatus
): Promise<ServerActionResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required" };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/orders/change-status/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ status: newOrderStatus }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { dbError: errorData.message || "Failed to update order status." };
    }

    const data = await response.json();
    if (!data.success) {
      return { dbError: data.message || "Failed to update order status." };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/customer-orders");

    return { success: true };
  } catch (error) {
    console.error("Change order status error:", error);
    return { dbError: "Failed to update order status." };
  }
}
