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

export async function fetchBillingById(id: string): Promise<BillingCustomer> {
  try {
    const response = await axiosInstance.get(`/api/billing/get-billing-by-id/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch billing");
    }

    return response.data.billing;
  } catch (error: any) {
    console.error("Error fetching billing:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch billing");
  }
}

export async function updateBilling(id: string, billingData: Partial<BillingCustomer>): Promise<BillingCustomer> {
  try {
    const response = await axiosInstance.put(`/api/billing/update-billing/${id}`, billingData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update billing");
    }

    return response.data.billing;
  } catch (error: any) {
    console.error("Error updating billing:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to update billing");
  }
}

export async function fetchCustomerOrders({ id }: { id: string }): Promise<{ customerOrders: CustomerOrder[] }> {
  try {
    const response = await axiosInstance.get(`/api/orders/get-orders-by-billing-id/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch customer orders");
    }

    return {
      customerOrders: response.data.orders || [],
    };
  } catch (error: any) {
    console.error("Error fetching customer orders:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch customer orders");
  }
}
