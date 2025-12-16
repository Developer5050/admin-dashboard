import { NextRequest, NextResponse } from "next/server";
import { getImageUrl } from "@/helpers/getImageUrl";

export async function GET(request: NextRequest) {
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

    // Forward the request to backend with the cookie
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Unauthorized" },
        { status: response.status }
      );
    }

    // Map backend user format to frontend format
    const user = {
      id: data.user._id,
      email: data.user.email,
      name: data.user.name,
      image_url: data.user.image_url ? getImageUrl(data.user.image_url) : null,
      role: data.user.role || null,
    };

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

