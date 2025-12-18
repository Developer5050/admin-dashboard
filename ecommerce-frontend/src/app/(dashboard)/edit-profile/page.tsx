import { Metadata } from "next";
import { redirect } from "next/navigation";

import PageTitle from "@/components/shared/PageTitle";
import EditProfileForm from "./_components/EditProfileForm";
import { getUser } from "@/helpers/getUser";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default async function EditProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Use user directly as profile
  const profile = user;

  return (
    <section>
      <PageTitle>Edit Profile</PageTitle>

      <EditProfileForm profile={profile} />
    </section>
  );
}
