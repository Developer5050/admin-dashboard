import { useUser, UserRole } from "@/contexts/UserContext";

const permissions = {
  orders: {
    canChangeStatus: ["admin"],
    canPrint: ["admin"],
  },
  categories: {
    canCreate: ["admin"],
    canDelete: ["admin"],
    canEdit: ["admin"],
    canTogglePublished: ["admin"],
  },
  coupons: {
    canCreate: ["admin"],
    canDelete: ["admin"],
    canEdit: ["admin"],
    canTogglePublished: ["admin"],
  },
  customers: {
    canDelete: ["admin"],
    canEdit: ["admin"],
  },
  products: {
    canCreate: ["admin"],
    canDelete: ["admin"],
    canEdit: ["admin"],
    canTogglePublished: ["admin"],
  },
  contacts: {
    canDelete: ["admin"],
  },
} as const;

type PermissionMap = typeof permissions;
type Feature = keyof PermissionMap;

export function useAuthorization() {
  const { user, profile, isLoading } = useUser();

  const hasPermission = <F extends Feature>(
    feature: F,
    action: keyof PermissionMap[F]
  ): boolean => {
    if (isLoading || !profile || !profile.role) return false;

    const allowedRoles = permissions[feature][action];
    return (allowedRoles as UserRole[]).includes(profile.role);
  };

  const isSelf = (staffId: string) => {
    return user?.id === staffId;
  };

  const isAdmin = (): boolean => {
    return profile?.role === "admin";
  };

  return { hasPermission, isSelf, isLoading, isAdmin };
}

export type HasPermission = ReturnType<
  typeof useAuthorization
>["hasPermission"];
export type IsSelf = ReturnType<typeof useAuthorization>["isSelf"];
