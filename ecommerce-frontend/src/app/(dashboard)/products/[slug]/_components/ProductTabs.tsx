"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Typography from "@/components/ui/typography";
import { ProductDetails } from "@/services/products/types";
import getProductReviews from "@/services/reviews/reviews";
import axiosInstance from "@/helpers/axiosInstance";

type Props = {
  product: ProductDetails;
};

// Admin approve mutation function
const approveReview = async (reviewId: string) => {
  const { data } = await axiosInstance.put(`/api/reviews/approve/${reviewId}`);
  return data;
};

export function ProductTabs({ product }: Props) {
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | null>(null);
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-reviews", product.id],
    queryFn: () => getProductReviews(product.id),
    enabled: activeTab === "reviews",
    staleTime: 0, // Always consider data stale to ensure fresh fetch after mutations
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: (reviewId: string) => approveReview(reviewId),
    onMutate: async (reviewId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["product-reviews", product.id] });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData(["product-reviews", product.id]);

      // Optimistically remove the approved review from the list
      queryClient.setQueryData(["product-reviews", product.id], (old: any) => {
        if (!old?.reviews) return old;
        return {
          ...old,
          reviews: old.reviews.filter((review: any) => review._id !== reviewId),
          count: old.count - 1,
        };
      });

      return { previousReviews };
    },
    onError: (err, reviewId, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        queryClient.setQueryData(["product-reviews", product.id], context.previousReviews);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["product-reviews", product.id] });
      queryClient.invalidateQueries({ queryKey: ["product-details", product.id] });
      // Force refetch to ensure UI updates
      queryClient.refetchQueries({ queryKey: ["product-reviews", product.id] });
    },
  });

  return (
    <div className="xl:ml-3 2xl:ml-12 lg:mr-28">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mt-12 lg:mt-44">
        <button
          onClick={() => setActiveTab(activeTab === "description" ? null : "description")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "description"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Description
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "reviews" ? null : "reviews")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "reviews"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Reviews
        </button>
      </div>

      {/* Content */}
      {activeTab && (
        <div className="-ml-2.5">
          {/* DESCRIPTION */}
          {activeTab === "description" && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Typography className="text-sm sm:text-base whitespace-pre-wrap">
                {product.description || "No description available."}
              </Typography>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
              {isLoading && <Typography>Loading reviews...</Typography>}
              {isError && <Typography>Failed to load reviews</Typography>}
              {data?.reviews?.length === 0 && <Typography>No reviews available yet.</Typography>}

              {data?.reviews?.map((review: any) => (
                <div
                  key={review._id}
                  className="border-b last:border-0 pb-3 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Typography className="font-semibold">{review.fullName}</Typography>
                      <span className="text-yellow-500 text-sm">{"★".repeat(review.rating)}</span>
                    </div>
                    <Typography className="text-sm text-muted-foreground">{review.comment}</Typography>
                  </div>

                  {/* Approve Button */}
                  {!review.isApproved && (
                    <button
                      onClick={() => approveMutation.mutate(review._id)}
                      disabled={approveMutation.isPending}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approveMutation.isPending ? "Approving..." : "Approve"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
