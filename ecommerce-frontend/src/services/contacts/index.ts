import {
  Contact,
  FetchContactsParams,
  FetchContactsResponse,
} from "./types";

// Backend contact type (from MongoDB/Mongoose)
interface BackendContact {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status?: "read" | "unread";
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// Transform backend contact to frontend format
function transformContact(backendContact: BackendContact): Contact {
  return {
    id: backendContact._id || backendContact.id || "",
    name: backendContact.name,
    email: backendContact.email,
    phone: backendContact.phone || null,
    subject: backendContact.subject || null,
    message: backendContact.message,
    status: backendContact.status || "unread", // Default to unread if not provided
    created_at: backendContact.createdAt || backendContact.created_at || new Date().toISOString(),
    updated_at: backendContact.updatedAt || backendContact.updated_at || new Date().toISOString(),
  };
}

export async function fetchContacts({
  page = 1,
  limit = 10,
  search,
}: FetchContactsParams): Promise<FetchContactsResponse> {
  try {
    // For now, we'll fetch all and paginate client-side
    // TODO: Implement backend pagination endpoint if needed
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/contacts/get-all-contacts`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to fetch contacts");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch contacts");
    }

    let contacts = (data.contacts || []).map(transformContact);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase().trim();
      contacts = contacts.filter(
        (contact: Contact) => {
          // Trim and normalize name for comparison
          const name = contact.name?.trim().toLowerCase() || "";
          // Trim email for comparison
          const email = contact.email?.trim().toLowerCase() || "";
          // Trim phone for comparison (if exists)
          const phone = contact.phone?.trim().toLowerCase() || "";
          
          return (
            name.includes(searchLower) ||
            email.includes(searchLower) ||
            (phone && phone.includes(searchLower))
          );
        }
      );
    }

    // Client-side pagination
    const totalItems = contacts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContacts = contacts.slice(startIndex, endIndex);

    return {
      data: paginatedContacts,
      pagination: {
        limit,
        current: page,
        items: totalItems,
        pages: totalPages,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

export async function fetchAllContacts(): Promise<Contact[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/contacts/get-all-contacts`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to fetch all contacts");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch all contacts");
    }

    return (data.contacts || []).map(transformContact);
  } catch (error) {
    console.error("Error fetching all contacts:", error);
    throw error;
  }
}

export async function fetchContactById(id: string): Promise<Contact> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/contacts/get-contact-by-id/${encodeURIComponent(id)}`,
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
        throw new Error("Contact not found");
      }
      throw new Error(errorData?.message || "Failed to fetch contact");
    }

    const data = await response.json();

    if (!data.success || !data.contact) {
      throw new Error(data.message || "Failed to fetch contact");
    }

    return transformContact(data.contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}
