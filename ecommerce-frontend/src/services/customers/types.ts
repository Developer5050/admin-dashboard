import { Database } from "@/types/supabase";
import { Pagination } from "@/types/pagination";
import { SBOrder } from "../orders/types";

export type SBCustomer = Database["public"]["Tables"]["customers"]["Row"];

// Billing/Customer from backend API
export interface BillingCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  country?: string;
  address?: string;
  city?: string;
  postcode?: string;
  shipToDifferentAddress?: boolean;
  orderNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Customer = BillingCustomer & {
  id: string; // Mapped from _id
};

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCustomersResponse {
  data: Customer[];
  pagination: Pagination;
}

export type CustomerOrder = Pick<
  SBOrder,
  | "id"
  | "invoice_no"
  | "masked_order_id"
  | "order_time"
  | "payment_method"
  | "total_amount"
  | "status"
> & {
  customers: Pick<SBCustomer, "name" | "address" | "phone"> & {
    firstName?: string;
    lastName?: string;
    company?: string;
  };
  order_items?: Array<{
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: {
      name: string;
      sku?: string;
      salesPrice?: number;
      images?: string[];
    };
  }>;
};
