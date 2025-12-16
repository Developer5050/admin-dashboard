import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: This callback route was used for Supabase OAuth flow
  // If you're using OAuth with your Node.js backend, implement the callback here
  // Otherwise, you can remove this file or redirect to home
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // TODO: Exchange code with your Node.js backend
    // Example:
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback?code=${code}`);
    // Handle the response and set session cookie
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
