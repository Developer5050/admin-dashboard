import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import PageTitle from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { InvoiceActions } from "@/app/(dashboard)/orders/[id]/_components/InvoiceActions";
import InvoicePdfTemplate from "@/app/(dashboard)/orders/[id]/_components/InvoicePdfTemplate";
import { OrderDetails } from "@/services/orders/types";

type PageParams = {
  params: {
    id: string;
  };
};

// Server-side function to fetch order details
async function fetchOrderDetailsServer(id: string): Promise<{ order: OrderDetails }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const response = await fetch(
    `${apiUrl}/api/orders/get-order-by-id/${encodeURIComponent(id)}`,
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
    if (response.status === 404) {
      throw new Error("Invoice not found");
    }
    throw new Error(errorData?.message || "Failed to fetch invoice details");
  }

  const data = await response.json();

  if (!data.success || !data.order) {
    throw new Error(data.message || "Failed to fetch invoice details");
  }

  return { order: data.order };
}

export async function generateMetadata({
  params: { id },
}: PageParams): Promise<Metadata> {
  try {
    const { order } = await fetchOrderDetailsServer(id);
    return { title: `Invoice #${order.invoice_no}` };
  } catch (e) {
    return { title: "Invoice not found" };
  }
}

export default async function Invoice({ params: { id } }: PageParams) {
  try {
    const { order } = await fetchOrderDetailsServer(id);

    return (
      <section>
        <div className="flex items-center gap-4 mb-6 print:hidden">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <PageTitle className="mb-0">Invoice</PageTitle>
        </div>

        <div className="mb-8 print:mb-0">
          <InvoicePdfTemplate order={order} />
        </div>

        <InvoiceActions order={order} />
      </section>
    );
  } catch (e) {
    return notFound();
  }
}
