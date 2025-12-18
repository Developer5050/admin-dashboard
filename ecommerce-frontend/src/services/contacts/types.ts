import { Pagination } from "@/types/pagination";

export type ContactStatus = "read" | "unread";

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
};

export interface FetchContactsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchContactsResponse {
  data: Contact[];
  pagination: Pagination;
}

