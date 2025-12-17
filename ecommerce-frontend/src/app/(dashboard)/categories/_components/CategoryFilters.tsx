"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Sync search state with URL params when they change externally
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearch(urlSearch);
  }, [searchParams]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Only add search if it has a value
    if (search && search.trim()) {
      params.set("search", search.trim());
    }

    // Preserve limit if it exists, otherwise set default
    const limit = searchParams.get("limit") || "10";
    params.set("limit", limit);
    
    // Always reset to page 1 when filtering
    params.set("page", "1");
    
    router.push(`/categories?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    const params = new URLSearchParams();
    
    // Preserve limit if it exists
    const limit = searchParams.get("limit");
    if (limit) {
      params.set("limit", limit);
    }
    
    // Reset to page 1
    params.set("page", "1");
    
    router.push(`/categories?${params.toString()}`);
  };

  return (
    <Card className="mb-5">
      <form
        onSubmit={handleFilter}
        className="flex flex-col md:flex-row gap-4 lg:gap-6"
      >
        <Input
          type="search"
          placeholder="Search by category name"
          className="h-12 md:basis-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap sm:flex-nowrap gap-4 md:basis-1/2">
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
