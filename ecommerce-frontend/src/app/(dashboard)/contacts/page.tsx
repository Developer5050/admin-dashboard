import { Metadata } from "next";

import PageTitle from "@/components/shared/PageTitle";
import ContactsTable from "./_components/contacts-table";
import ContactFilters from "./_components/ContactFilters";

export const metadata: Metadata = {
  title: "Contacts",
};

export default async function ContactsPage() {
  return (
    <section>
      <PageTitle>All Contacts</PageTitle>

      <ContactFilters />
      <ContactsTable />
    </section>
  );
}

