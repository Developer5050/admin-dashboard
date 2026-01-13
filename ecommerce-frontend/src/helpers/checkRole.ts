import { UserRole } from "@/contexts/UserContext";
import { getUser } from "./getUser";

/**
 * Check if the current user has a specific role
 * @param role - The role to check for
 * @returns Promise<boolean> - True if user has the role, false otherwise
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getUser();
  return user?.role === role;
}

/**
 * Check if the current user is an admin
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if the current user is a regular user
 * @returns Promise<boolean> - True if user is a regular user, false otherwise
 */
export async function isUser(): Promise<boolean> {
  return hasRole("user");
}
