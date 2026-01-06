import axiosInstance from "@/helpers/axiosInstance";
import {
  Customer,
  FetchCustomersParams,
  FetchCustomersResponse,
  CustomerOrder,
  BillingCustomer,
} from "./types";

export async function fetchCustomers({
  page = 1,
  limit = 10,
  search,
}: FetchCustomersParams): Promise<FetchCustomersResponse> {
  try {
    const response = await axiosInstance.get("/api/billing/get-all-billing");
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch customers");
    }

    let billingData: BillingCustomer[] = response.data.billing || [];

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      billingData = billingData.filter(
        (billing) =>
          billing.firstName?.toLowerCase().includes(searchLower) ||
          billing.lastName?.toLowerCase().includes(searchLower) ||
          billing.email?.toLowerCase().includes(searchLower) ||
          billing.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Transform billing data to customer format
    const customers: Customer[] = billingData.map((billing) => ({
      ...billing,
      id: billing._id,
    }));

    // Client-side pagination
    const totalItems = customers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = customers.slice(startIndex, endIndex);

    return {
      data: paginatedCustomers,
      pagination: {
        limit,
        current: page,
        items: totalItems,
        pages: totalPages,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch customers");
  }
}

export async function fetchCustomerOrders({ id }: { id: string }): Promise<{ customerOrders: CustomerOrder[] }> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${id}/orders`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch customer orders');
  // const data = await response.json();
  // return { customerOrders: data };

  throw new Error("Backend not configured. Please set up Node.js backend.");
}
