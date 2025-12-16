import { NextResponse } from "next/server";

import { siteUrl } from "@/constants/siteUrl";

export async function POST() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    // Call backend logout endpoint
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Continue with logout even if backend call fails
  }

  // Clear token cookie and redirect
  const response = NextResponse.redirect(`${siteUrl}/login`, {
    status: 301,
  });
  response.cookies.delete("token");
  response.cookies.delete("session_token"); // Clear old cookie name if exists
  
  return response;
}
