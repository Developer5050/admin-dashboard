// TODO: Replace all Supabase client calls with Node.js backend API calls

import {
  Staff,
  StaffRolesDropdown,
  FetchStaffParams,
  FetchStaffResponse,
  SBStaff,
} from "./types";

export async function fetchStaff({
  page = 1,
  limit = 10,
  search,
  role,
}: FetchStaffParams): Promise<FetchStaffResponse> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const params = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   ...(search && { search }),
  //   ...(role && { role }),
  // });
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/staff?${params}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch staff');
  // return await response.json();

  // Placeholder response
  return {
    data: [],
    pagination: {
      limit,
      current: page,
      items: 0,
      pages: 0,
      next: null,
      prev: null,
    },
  };
}

export async function fetchStaffRolesDropdown(): Promise<StaffRolesDropdown[]> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/staff/roles`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch staff roles');
  // return await response.json();

  return [];
}

export async function fetchStaffDetails(): Promise<SBStaff | null> {
  try {
    const response = await fetch("/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result.success || !result.user) {
      return null;
    }

    // Map backend user format to SBStaff format
    const staff: SBStaff = {
      id: result.user.id,
      name: result.user.name || "",
      email: result.user.email || "",
      role: result.user.role || "staff",
      image_url: result.user.image_url || null,
      phone: result.user.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published: true, // Default to active
    } as SBStaff;

    return staff;
  } catch (error) {
    console.error("Error fetching staff details:", error);
    return null;
  }
}
