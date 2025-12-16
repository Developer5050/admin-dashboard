import { NextResponse } from "next/server";

import { passwordResetFormSchema } from "@/app/(authentication)/forgot-password/_components/schema";
import validateFormData from "@/helpers/validateFormData";
import { siteUrl } from "@/constants/siteUrl";

export async function POST(request: Request) {
  // Get form fields
  const { email } = await request.json();

  // Server side form validation
  const { errors } = validateFormData(passwordResetFormSchema, {
    email,
  });

  // If there are validation errors, return a JSON response with the errors and a 401 status.
  if (errors) {
    return NextResponse.json({ errors }, { status: 401 });
  }

  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, redirectTo: `${siteUrl}/update-password` }),
  // });
  // 
  // if (!response.ok) {
  //   const error = await response.json();
  //   return NextResponse.json({ errors: { email: error.message } }, { status: 401 });
  // }
  // 
  // return NextResponse.json({ success: true });

  // Placeholder response - replace with actual backend call
  return NextResponse.json(
    { errors: { email: "Backend not configured. Please set up Node.js backend." } },
    { status: 401 }
  );
}
