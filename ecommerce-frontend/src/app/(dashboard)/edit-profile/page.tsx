import { Metadata } from "next";
import { redirect } from "next/navigation";

import PageTitle from "@/components/shared/PageTitle";
import EditProfileForm from "./_components/EditProfileForm";
import { getUser } from "@/helpers/getUser";
import { SBStaff } from "@/services/staff/types";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default async function EditProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Map user to SBStaff format
  const profile: SBStaff = {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "staff",
    image_url: user.image_url || null,
    phone: user.phone || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published: true,
  } as SBStaff;

  return (
    <section>
      <PageTitle>Edit Profile</PageTitle>

      <EditProfileForm profile={profile} />
    </section>
  );
}
