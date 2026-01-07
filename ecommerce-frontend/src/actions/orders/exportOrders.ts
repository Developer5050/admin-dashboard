"use server";

import { cookies } from "next/headers";
import { OrdersExport } from "@/services/orders/types";
import { getDiscount } from "@/helpers/getDiscount";

type ExportOrdersParams = {
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
};

export async function exportOrders(filters?: ExportOrdersParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    // Build query parameters with filters
    const params = new URLSearchParams();
    // Set a very high limit to get all orders (or you can fetch in batches)
    params.set("limit", "10000");
    params.set("page", "1");
    
    if (filters?.search) {
      params.set("search", filters.search);
    }
    if (filters?.status && filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters?.method && filters.method !== "all") {
      params.set("method", filters.method);
    }
    if (filters?.startDate) {
      params.set("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      params.set("endDate", filters.endDate);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/orders/get-all-orders?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Error fetching orders:`, errorData);
      return { error: errorData?.message || "Failed to fetch orders" };
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return { error: data.message || "Failed to fetch orders" };
    }

    // Transform orders to match OrdersExport type
    const exportData: OrdersExport[] = data.data.map((order: any) => {
      const customerName = order.customers?.name || "";
      const customerEmail = order.customers?.email || "";
      
      // Calculate discount from discountAmount if available
      const discountAmount = order.discountAmount || 0;
      
      return {
        id: order.id,
        invoice_no: order.invoice_no,
        customer_name: customerName,
        customer_email: customerEmail,
        total_amount: order.total_amount,
        discount: discountAmount.toFixed(2),
        shipping_cost: order.shipping_cost,
        payment_method: order.payment_method,
        order_time: order.order_time,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
      };
    });

    return { data: exportData };
  } catch (error) {
    console.error("Error exporting orders:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to export orders",
    };
  }
}
