import { Metadata } from "next";

import PageTitle from "@/components/shared/PageTitle";
import AllInvoices from "./_components/invoices-table";
import InvoiceFilters from "./_components/InvoiceFilters";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function InvoicesPage() {
  return (
    <section>
      <PageTitle>Invoices</PageTitle>

      <InvoiceFilters />
      <AllInvoices />
    </section>
  );
}
