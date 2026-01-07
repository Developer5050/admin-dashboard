"use server";

import { cookies } from "next/headers";

export type OrderStatistics = {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
};

export async function getOrderStatistics(): Promise<{
  data?: OrderStatistics;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/orders/statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || "Failed to fetch order statistics" };
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return { error: result.message || "Failed to fetch order statistics" };
    }

    return { data: result.data };
  } catch (error) {
    console.error("Get order statistics error:", error);
    return { error: "Failed to fetch order statistics" };
  }
}

