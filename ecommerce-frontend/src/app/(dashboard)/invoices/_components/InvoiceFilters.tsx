"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DownloadCloud, Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/shared/DatePicker";

import { exportAsCSV } from "@/helpers/exportData";
import { exportOrders } from "@/actions/orders/exportOrders";

export default function InvoiceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    method: searchParams.get("method") || "",
    startDate: searchParams.get("start-date") || "",
    endDate: searchParams.get("end-date") || "",
  });

  const handleInvoicesDownload = () => {
    toast.info(`Downloading invoices...`);

    startTransition(async () => {
      // Prepare filter parameters from current filters
      const filterParams = {
        search: filters.search || undefined,
        method: filters.method && filters.method !== "all" ? filters.method : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };

      const result = await exportOrders(filterParams);

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        exportAsCSV(result.data, "Invoices");
        toast.success("Invoices downloaded successfully!");
      }
    });
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.method && filters.method !== "all")
      params.set("method", filters.method);
    if (filters.startDate) params.set("start-date", filters.startDate);
    if (filters.endDate) params.set("end-date", filters.endDate);

    params.set("page", "1");
    params.set("limit", searchParams.get("limit") || "10");
    router.push(`/invoices?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      method: "",
      startDate: "",
      endDate: "",
    });
    router.push("/invoices");
  };

  const handleSetStartDate = (date: string) => {
    setFilters({ ...filters, startDate: date });
  };

  const handleSetEndDate = (date: string) => {
    setFilters({ ...filters, endDate: date });
  };

  return (
    <Card className="mb-5">
      <form onSubmit={handleFilter} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
          <Input
            type="search"
            placeholder="Search by invoice number or customer name"
            className="h-12 md:basis-1/3"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <Select
            value={filters.method}
            onValueChange={(value) => setFilters({ ...filters, method: value })}
          >
            <SelectTrigger className="capitalize md:basis-1/3">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleInvoicesDownload}
            disabled={isPending}
            className="h-12 flex-shrink-0 md:basis-1/3"
          >
            Download{" "}
            {isPending ? (
              <Loader2 className="ml-2 size-4 animate-spin" />
            ) : (
              <DownloadCloud className="ml-2 size-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-4 lg:gap-6">
          <div className="md:basis-[35%]">
            <Label className="text-muted-foreground font-normal">
              Start date
            </Label>
            <DatePicker date={filters.startDate} setDate={handleSetStartDate} />
          </div>

          <div className="md:basis-[35%]">
            <Label className="text-muted-foreground font-normal">
              End date
            </Label>
            <DatePicker date={filters.endDate} setDate={handleSetEndDate} />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-4 md:basis-[30%]">
            <Button type="submit" size="lg" className="h-12 flex-grow">
              Filter
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="h-12 flex-grow"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
