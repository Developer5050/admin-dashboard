"use client";

import { useState } from "react";
import Typography from "@/components/ui/typography";
import { ProductDetails } from "@/services/products/types";

type Props = {
  product: ProductDetails;
};

export function ProductTabs({ product }: Props) {
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | null>(null);

  return (
    <div className="xl:ml-3 2xl:ml-12 lg:mr-28">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mt-12 lg:mt-44">
        <button
          onClick={() => setActiveTab(activeTab === "description" ? null : "description")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "description"
              ? "text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab(activeTab === "reviews" ? null : "reviews")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "reviews"
              ? "text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Reviews
        </button>
      </div>

      {/* Tab Content */}
      {activeTab && (
        <div className="-ml-2.5">
          {activeTab === "description" && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Typography component="p" className="text-sm sm:text-base text-foreground whitespace-pre-wrap">
                {product.description || "No description available."}
              </Typography>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Typography component="p" className="text-sm sm:text-base text-foreground">
                No reviews available yet.
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

