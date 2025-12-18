"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    params.set("page", "1");
    params.set("limit", searchParams.get("limit") || "10");
    router.push(`/contacts?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push("/contacts");
  };

  return (
    <Card className="mb-5">
      <form
        onSubmit={handleFilter}
        className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-6"
      >
        <Input
          type="search"
          placeholder="Search by name, email or phone"
          className="h-12 md:basis-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap sm:flex-nowrap gap-4 md:basis-1/3 md:justify-end md:ml-auto">
          <Button type="submit" size="lg" className="flex-grow">
            Filter
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="flex-grow"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}

