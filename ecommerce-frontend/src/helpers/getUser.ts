import { cookies } from "next/headers";
import { getImageUrl } from "./getImageUrl";

export type User = {
  id: string;
  email: string;
  name?: string;
  image_url?: string;
  role?: string;
  phone?: string | null;
};

/**
 * getUser - Function to retrieve user information from backend API.
 * This is a server-side function that uses Next.js cookies to get the token.
 * @returns A Promise that resolves to the user data or null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(`${apiUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
      cache: "no-store", // Ensure fresh data on each request
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.user) {
      return null;
    }

    // Map backend user format to frontend format
    return {
      id: data.user._id || data.user.id,
      email: data.user.email,
      name: data.user.name,
      image_url: data.user.image_url ? getImageUrl(data.user.image_url) : undefined,
      role: data.user.role,
      phone: data.user.phone || null,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
