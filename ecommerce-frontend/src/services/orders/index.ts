import {
  Order,
  FetchOrdersParams,
  FetchOrdersResponse,
  OrderDetails,
} from "./types";

export async function fetchOrders({
  page = 1,
  limit = 10,
  search,
  status,
  method,
  startDate,
  endDate,
}: FetchOrdersParams): Promise<FetchOrdersResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(method && { method }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/orders/get-all-orders?${params}`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to fetch orders");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch orders");
    }

    return {
      data: data.data || [],
      pagination: data.pagination || {
        limit,
        current: page,
        items: 0,
        pages: 0,
        next: null,
        prev: null,
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function fetchOrderDetails({ id }: { id: string }): Promise<{ order: OrderDetails }> {
  try {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/orders/get-order-by-id/${encodeURIComponent(id)}`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error("Order not found");
      }
      throw new Error(errorData?.message || "Failed to fetch order details");
    }

    const data = await response.json();

    if (!data.success || !data.order) {
      throw new Error(data.message || "Failed to fetch order details");
    }

    return { order: data.order };
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

export type OrderStatistics = {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
};

export async function fetchOrderStatistics(): Promise<OrderStatistics> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/orders/statistics`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to fetch order statistics");
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch order statistics");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    throw error;
  }
}

export type SalesStatistics = {
  today: number;
  yesterday: number;
  thisMonth: number;
  lastMonth: number;
  allTime: number;
};

export async function fetchSalesStatistics(): Promise<SalesStatistics> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/orders/sales-statistics`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to fetch sales statistics");
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch sales statistics");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching sales statistics:", error);
    throw error;
  }
}
