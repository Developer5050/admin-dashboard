import { NextResponse } from "next/server";

import { loginFormSchema } from "@/app/(authentication)/login/_components/schema";
import validateFormData from "@/helpers/validateFormData";

export async function POST(request: Request) {
  try {
    // Get form fields
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { errors: { password: "Invalid request body." } },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Server side form validation
    const { errors } = validateFormData(loginFormSchema, {
      email,
      password,
    });

    // If there are validation errors, return a JSON response with the errors and a 401 status.
    if (errors) {
      return NextResponse.json({ errors }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      return NextResponse.json(
        { errors: { password: "Invalid response from server." } },
        { status: 500 }
      );
    }

    if (!response.ok) {
      // Handle backend validation errors
      if (data.message) {
        return NextResponse.json(
          { errors: { password: data.message } },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { errors: { password: "Invalid email or password." } },
        { status: response.status }
      );
    }

    // Create response with success
    const nextResponse = NextResponse.json(
      { success: true, message: data.message },
      { status: 200 }
    );

    // Set cookie using token from response body to avoid headers overflow
    // The backend sends token in the response body, so we use that instead of parsing headers
    if (data.token) {
      nextResponse.cookies.set("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { errors: { password: error instanceof Error ? error.message : "Failed to connect to backend server." } },
      { status: 500 }
    );
  }
}
