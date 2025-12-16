import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    // Get the token cookie from the request
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Get form data from request
    const formData = await request.formData();

    // Forward the request to backend with the cookie
    const response = await fetch(`${apiUrl}/api/auth/profile`, {
      method: "PUT",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to update profile",
          errors: data.errors || {}
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: data.message, user: data.user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

