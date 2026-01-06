"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { customerFormSchema } from "@/app/(dashboard)/customers/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CustomerServerActionResponse } from "@/types/server-action";

export async function editCustomer(
  customerId: string,
  formData: FormData
): Promise<CustomerServerActionResponse> {
  try {
    const parsedData = customerFormSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    });

    if (!parsedData.success) {
      return {
        validationErrors: formatValidationErrors(
          parsedData.error.flatten().fieldErrors
        ),
      };
    }

    const customerData = parsedData.data;

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { dbError: "Authentication required. Please login again." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // First, fetch existing billing record to preserve required fields
    const getBillingResponse = await fetch(
      `${apiUrl}/api/billing/get-billing-by-id/${customerId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        credentials: "include",
      }
    );

    if (!getBillingResponse.ok) {
      const errorData = await getBillingResponse.json().catch(() => ({}));
      return {
        dbError: errorData.message || "Failed to fetch customer data. Please try again.",
      };
    }

    const billingData = await getBillingResponse.json();
    if (!billingData.success || !billingData.billing) {
      return {
        dbError: "Customer not found. Please refresh and try again.",
      };
    }

    const existingBilling = billingData.billing;

    // Prepare update data with existing fields and new values
    const updateData = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone || existingBilling.phone || "",
      // Preserve other required fields from existing billing
      company: existingBilling.company || "",
      country: existingBilling.country || "",
      address: existingBilling.address || "",
      city: existingBilling.city || "",
      postcode: existingBilling.postcode || "",
      shipToDifferentAddress: existingBilling.shipToDifferentAddress || false,
      orderNotes: existingBilling.orderNotes || "",
    };

    // Update billing via backend API
    const updateResponse = await fetch(
      `${apiUrl}/api/billing/update-billing/${customerId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      }
    );

    const updateResult = await updateResponse.json();

    if (!updateResponse.ok) {
      if (updateResult.errors) {
        return {
          validationErrors: formatValidationErrors(updateResult.errors),
        };
      }
      return {
        dbError: updateResult.message || "Failed to update customer. Please try again later.",
      };
    }

    if (!updateResult.success || !updateResult.billing) {
      return {
        dbError: "Failed to update customer. Please try again later.",
      };
    }

    const updatedBilling = updateResult.billing;

    // Transform to customer format expected by frontend
    const updatedCustomer = {
      id: updatedBilling._id,
      _id: updatedBilling._id,
      firstName: updatedBilling.firstName,
      lastName: updatedBilling.lastName,
      email: updatedBilling.email,
      phone: updatedBilling.phone,
      company: updatedBilling.company,
      country: updatedBilling.country,
      address: updatedBilling.address,
      city: updatedBilling.city,
      postcode: updatedBilling.postcode,
      shipToDifferentAddress: updatedBilling.shipToDifferentAddress,
      orderNotes: updatedBilling.orderNotes,
      createdAt: updatedBilling.createdAt,
      updatedAt: updatedBilling.updatedAt,
    };

    revalidatePath("/customers");
    revalidatePath(`/customer-orders/${updatedCustomer.id}`);

    return { success: true, customer: updatedCustomer as any };
  } catch (error: any) {
    console.error("Customer update failed:", error);
    return {
      dbError: error.message || "Something went wrong. Please try again later.",
    };
  }
}
