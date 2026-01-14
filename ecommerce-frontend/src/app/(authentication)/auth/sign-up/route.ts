import { NextResponse } from "next/server";

import { signupFormSchema } from "@/app/(authentication)/signup/_components/schema";
import validateFormData from "@/helpers/validateFormData";

export async function POST(request: Request) {
  const { name, email, password, confirmPassword, privacy } =
    await request.json();

  // Server side form validation
  const { errors } = validateFormData(signupFormSchema, {
    name,
    email,
    password,
    confirmPassword,
    privacy,
  });

  // If there are validation errors, return a JSON response with the errors and a 401 status.
  if (errors) {
    return NextResponse.json({ errors }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  try {
    const response = await fetch(`${apiUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword,
        role: "admin", // Set role as admin for admin dashboard signups
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle backend validation errors
      if (data.message) {
        return NextResponse.json(
          { errors: { email: data.message } },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { errors: { email: "An error occurred during signup." } },
        { status: response.status }
      );
    }

    // Create response with success
    const nextResponse = NextResponse.json(
      { success: true, message: data.message },
      { status: 201 }
    );

    // Don't forward the token cookie - user should login separately after signup
    // This allows redirect to login page without middleware redirecting to dashboard
    // Also clear any existing token cookie to ensure user is not logged in
    nextResponse.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return nextResponse;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { errors: { email: "Failed to connect to backend server." } },
      { status: 500 }
    );
  }
}
