"use client";

import {
  HiOutlineShoppingCart,
  HiOutlineRefresh,
  HiOutlineCheck,
} from "react-icons/hi";
import { BsTruck } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Typography from "@/components/ui/typography";
import { DashboardCard } from "@/types/card";
import { fetchOrderStatistics } from "@/services/orders";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatusOverview() {
  const {
    data: statistics,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["order-statistics"],
    queryFn: fetchOrderStatistics,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    staleTime: Infinity, // Data will never be considered stale
  });

  const defaultStatistics = {
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
  };

  const stats = statistics || defaultStatistics;

  const cards: DashboardCard[] = [
    {
      icon: <HiOutlineShoppingCart />,
      title: "Total Orders",
      value: stats.total.toString(),
      className:
        "text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-500",
    },
    {
      icon: <HiOutlineRefresh />,
      title: "Orders Pending",
      value: stats.pending.toString(),
      className:
        "text-teal-600 dark:text-teal-100 bg-teal-100 dark:bg-teal-500",
    },
    {
      icon: <BsTruck />,
      title: "Orders Processing",
      value: stats.processing.toString(),
      className:
        "text-blue-600 dark:text-blue-100 bg-blue-100 dark:bg-blue-500",
    },
    {
      icon: <HiOutlineCheck />,
      title: "Orders Delivered",
      value: stats.delivered.toString(),
      className:
        "text-emerald-600 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-500",
    },
  ];

  if (isLoading || isFetching) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`skeleton-${index}`}>
            <CardContent className="flex items-center gap-3 p-0">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex flex-col gap-y-1 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-3 p-0">
              <div
                className={cn(
                  "size-12 rounded-full grid place-items-center [&>svg]:size-5",
                  card.className
                )}
              >
                {card.icon}
              </div>

              <div className="flex flex-col gap-y-1">
                <Typography className="text-sm text-muted-foreground">
                  {card.title}
                </Typography>

                <Typography className="text-2xl font-semibold text-popover-foreground">
                  {card.value}
                </Typography>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="flex items-center gap-3 p-0">
            <div
              className={cn(
                "size-12 rounded-full grid place-items-center [&>svg]:size-5",
                card.className
              )}
            >
              {card.icon}
            </div>

            <div className="flex flex-col gap-y-1">
              <Typography className="text-sm text-muted-foreground">
                {card.title}
              </Typography>

              <Typography className="text-2xl font-semibold text-popover-foreground">
                {card.value}
              </Typography>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
