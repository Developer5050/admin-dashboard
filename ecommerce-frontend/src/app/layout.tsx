import { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme-provider";
import TanstackQueryProvider from "@/lib/tanstack-query-provider";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { getUser } from "@/helpers/getUser";

// TODO: Remove or adjust dynamic rendering based on your Node.js backend needs
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s - Zorvex",
    default: "Zorvex",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data server-side to prevent initial loading flash
  const user = await getUser();

  // Map user data to match UserContext format
  const initialUserData = user
    ? {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image_url: user.image_url,
          role: user.role as "admin" | "manager" | "staff" | undefined,
        },
        profile: {
          name: user.name || null,
          image_url: user.image_url || null,
          role: (user.role as "admin" | "manager" | "staff") || null,
        },
      }
    : { user: null, profile: null };

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TanstackQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <UserProvider initialUserData={initialUserData}>
              <TooltipProvider>{children}</TooltipProvider>

              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
