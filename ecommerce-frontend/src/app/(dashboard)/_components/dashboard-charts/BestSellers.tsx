"use client";

import { Pie } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Typography from "@/components/ui/typography";
import useGetMountStatus from "@/hooks/use-get-mount-status";
import { fetchBestSellers } from "@/services/orders";

export default function BestSellers() {
  const mounted = useGetMountStatus();
  const { theme } = useTheme();

  const {
    data: bestSellersData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: fetchBestSellers,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Default colors for the chart
  const chartColors = [
    "rgb(34, 197, 94)",
    "rgb(59, 130, 246)",
    "rgb(249, 115, 22)",
    "rgb(99, 102, 241)",
  ];

  // Transform data for chart
  const labels = bestSellersData?.map((item) => item.name) || [];
  const quantities = bestSellersData?.map((item) => item.quantity) || [];

  // Use default data if no data is available
  const hasData = bestSellersData && bestSellersData.length > 0;

  return (
    <Card>
      <Typography variant="h3" className="mb-4">
        Best Selling Products
      </Typography>

      <CardContent className="pb-2">
        <div className="relative h-[18.625rem]">
          {mounted && !isLoading && !isFetching && !isError && hasData ? (
            <Pie
              data={{
                labels,
                datasets: [
                  {
                    label: "Orders",
                    data: quantities,
                    backgroundColor: chartColors.slice(0, labels.length),
                    borderColor:
                      theme === "light" ? "rgb(255,255,255)" : "rgb(23,23,23)",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <Skeleton className="size-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
