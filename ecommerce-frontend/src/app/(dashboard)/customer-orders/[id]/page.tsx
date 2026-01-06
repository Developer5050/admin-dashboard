import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { IoBagHandle } from "react-icons/io5";

import { Card } from "@/components/ui/card";
import Typography from "@/components/ui/typography";
import PageTitle from "@/components/shared/PageTitle";

import OrderCardList from "./_components/OrderCardList";
import { BillingCustomer, CustomerOrder } from "@/services/customers/types";

type PageParams = {
  params: {
    id: string;
  };
};

// Server-side function to fetch billing by ID
async function fetchBillingByIdServer(id: string): Promise<BillingCustomer> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const response = await fetch(`${apiUrl}/api/billing/get-billing-by-id/${id}`, {
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
    throw new Error(errorData.message || "Failed to fetch billing");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch billing");
  }

  return data.billing;
}

// Server-side function to fetch customer orders
async function fetchCustomerOrdersServer(id: string): Promise<{ customerOrders: CustomerOrder[] }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const response = await fetch(`${apiUrl}/api/orders/get-orders-by-billing-id/${id}`, {
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
    throw new Error(errorData.message || "Failed to fetch customer orders");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch customer orders");
  }

  return {
    customerOrders: data.orders || [],
  };
}

export async function generateMetadata({
  params: { id },
}: PageParams): Promise<Metadata> {
  try {
    // First check if billing exists
    const billing = await fetchBillingByIdServer(id);
    
    // Then fetch orders
    const { customerOrders } = await fetchCustomerOrdersServer(id);

    if (customerOrders.length === 0) {
      return { title: `${billing.firstName} ${billing.lastName} - No orders` };
    }

    return { title: `${billing.firstName} ${billing.lastName} - Orders` };
  } catch (e) {
    return { title: "Customer not found" };
  }
}

export default async function CustomerOrders({ params: { id } }: PageParams) {
  try {
    // First check if billing/customer exists
    await fetchBillingByIdServer(id);
    
    // Then fetch orders (this will return empty array if no orders, not an error)
    const { customerOrders } = await fetchCustomerOrdersServer(id);

    return (
      <section>
        <PageTitle>Customer Order List</PageTitle>

        {customerOrders.length === 0 ? (
          <Card className="w-full flex flex-col text-center items-center py-8">
            <IoBagHandle className="text-red-500 size-20 mb-4" />
            <Typography>This customer has no order yet!</Typography>
          </Card>
        ) : (
          <OrderCardList orders={customerOrders} />
        )}
      </section>
    );
  } catch (e) {
    // Only show 404 if billing doesn't exist
    return notFound();
  }
}
