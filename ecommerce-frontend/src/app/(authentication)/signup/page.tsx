import { Metadata } from "next";
import AuthFormTemplate from "@/components/shared/auth/AuthFormTemplate";
import SignupForm from "./_components/SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function Page() {
  return (
    <AuthFormTemplate image="/assets/signup.jpg">
      <SignupForm />
    </AuthFormTemplate>
  );
}
