import { redirect } from "next/navigation";
import { isAdmin } from "@/helpers/checkRole";

type AdminOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Server component that only renders children if user is admin
 * Redirects to dashboard if user is not admin
 */
export default async function AdminOnly({
  children,
  fallback,
}: AdminOnlyProps) {
  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }
    redirect("/");
  }

  return <>{children}</>;
}
