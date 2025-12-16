import { NextResponse } from "next/server";

import { passwordUpdateFormSchema } from "@/app/(authentication)/update-password/_components/schema";
import validateFormData from "@/helpers/validateFormData";

export async function POST(request: Request) {
  // Get form fields
  const { password, confirmPassword, code } = await request.json();

  // Server side form validation
  const { errors } = validateFormData(passwordUpdateFormSchema, {
    password,
    confirmPassword,
  });

  // If there are validation errors, return a JSON response with the errors and a 401 status.
  if (errors) {
    return NextResponse.json({ errors }, { status: 401 });
  }

  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ password, code }),
  // });
  // 
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json({ errors: { password: error.message } }, { status: 401 });
  // }
  // 
  // return NextResponse.json({ success: true });

  // Placeholder response - replace with actual backend call
  return NextResponse.json(
    { errors: { password: "Backend not configured. Please set up Node.js backend." } },
    { status: 401 }
  );
}
