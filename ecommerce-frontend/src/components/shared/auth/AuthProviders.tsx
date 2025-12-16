"use client";

import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { siteUrl } from "@/constants/siteUrl";

type AuthProvider = "github" | "google";

type Props = {
  authType?: "Login" | "Signup";
};

export default function AuthProviders({ authType = "Login" }: Props) {
  // TODO: Replace with Node.js backend OAuth implementation
  // Example:
  // const handleAuth = (authProvider: AuthProvider) => {
  //   window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${authProvider}?redirectTo=${encodeURIComponent(`${siteUrl}/auth/callback`)}`;
  // };

  const handleAuth = (authProvider: AuthProvider) => {
    // Placeholder - implement OAuth with your Node.js backend
    console.log(`OAuth ${authProvider} not configured. Please set up Node.js backend.`);
  };

  return (
    <div className="space-y-4 mb-10">
      <Button
        onClick={() => handleAuth("github")}
        variant="secondary"
        className="w-full min-h-14"
      >
        <FaGithub className="mr-3 size-4" />
        {authType} With Github
      </Button>

      <Button
        onClick={() => handleAuth("google")}
        variant="secondary"
        className="w-full min-h-14"
      >
        <FcGoogle className="mr-3 size-4" />
        {authType} With Google
      </Button>
    </div>
  );
}
