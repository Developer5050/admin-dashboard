import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Invoice not found",
};

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold">Invoice Not Found</h1>
      <p className="text-muted-foreground">
        The invoice you are looking for does not exist.
      </p>
      <Link href="/invoices">
        <Button>Back to Invoices</Button>
      </Link>
    </div>
  );
}
