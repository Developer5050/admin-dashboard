"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/helpers/getImageUrl";

export type UserRole = "admin" | "user";

type UserProfile = {
  name: string | null;
  image_url: string | null;
  role: UserRole | null;
};

type User = {
  id: string;
  email: string;
  name?: string;
  image_url?: string;
  role?: UserRole;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isLoading: true,
});

type InitialUserData = {
  user: User | null;
  profile: UserProfile | null;
};

export function UserProvider({
  children,
  initialUserData,
}: {
  children: React.ReactNode;
  initialUserData?: InitialUserData;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const response = await fetch("/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          // Don't log errors for expected 401 (unauthorized) responses
          // This is normal when user is not authenticated
          if (response.status !== 401) {
            console.error("Error fetching user profile:", response.status, response.statusText);
          }
          return { user: null, profile: null };
        }

        const result = await response.json();

        if (!result.success || !result.user) {
          return { user: null, profile: null };
        }

        const user: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          image_url: result.user.image_url ? getImageUrl(result.user.image_url) : undefined,
          role: result.user.role as UserRole | undefined,
        };

        const profile: UserProfile = {
          name: result.user.name || null,
          image_url: result.user.image_url ? getImageUrl(result.user.image_url) : null,
          role: (result.user.role as UserRole) || null,
        };

        return { user, profile };
      } catch (error) {
        // Only log unexpected errors, not authentication failures
        console.error("Error fetching user profile:", error);
        return { user: null, profile: null };
      }
    },
    initialData: initialUserData,
    staleTime: Infinity,
    retry: false,
  });

  const value = {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
