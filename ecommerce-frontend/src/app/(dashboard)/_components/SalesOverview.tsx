"use client";

import { HiOutlineRefresh } from "react-icons/hi";
import { HiOutlineSquare3Stack3D, HiCalendarDays } from "react-icons/hi2";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import Typography from "@/components/ui/typography";
import { DashboardCard } from "@/types/card";
import { fetchSalesStatistics } from "@/services/orders";
import { formatAmount } from "@/helpers/formatAmount";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesOverview() {
  const {
    data: salesStatistics,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["sales-statistics"],
    queryFn: fetchSalesStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    staleTime: 0, // Always consider data stale to ensure fresh fetch
  });

  const defaultStatistics = {
    today: 0,
    yesterday: 0,
    thisMonth: 0,
    lastMonth: 0,
    allTime: 0,
  };

  const stats = salesStatistics || defaultStatistics;

  const cards: DashboardCard[] = [
    {
      icon: <HiOutlineSquare3Stack3D />,
      title: "Today Orders",
      value: formatAmount(stats.today),
      className: "bg-teal-600",
    },
    {
      icon: <HiOutlineSquare3Stack3D />,
      title: "Yesterday Orders",
      value: formatAmount(stats.yesterday),
      className: "bg-orange-400",
    },
    {
      icon: <HiOutlineRefresh />,
      title: "This Month",
      value: formatAmount(stats.thisMonth),
      className: "bg-blue-500",
    },
    {
      icon: <HiCalendarDays />,
      title: "Last Month",
      value: formatAmount(stats.lastMonth),
      className: "bg-cyan-600",
    },
    {
      icon: <HiCalendarDays />,
      title: "All-Time Sales",
      value: formatAmount(stats.allTime),
      className: "bg-emerald-600",
    },
  ];

  if (isLoading || isFetching) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={`skeleton-${index}`}
            className="h-32 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-2">
        {cards.map((card, index) => (
          <div
            key={`sales-overview-${index}`}
            className={cn(
              "p-6 rounded-lg flex flex-col items-center justify-center space-y-3 text-white text-center",
              card.className
            )}
          >
            <div className="[&>svg]:size-8">{card.icon}</div>

            <Typography className="text-base">{card.title}</Typography>

            <Typography className="text-2xl font-semibold">
              {card.value}
            </Typography>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-2">
      {cards.map((card, index) => (
        <div
          key={`sales-overview-${index}`}
          className={cn(
            "p-6 rounded-lg flex flex-col items-center justify-center space-y-3 text-white text-center",
            card.className
          )}
        >
          <div className="[&>svg]:size-8">{card.icon}</div>

          <Typography className="text-base">{card.title}</Typography>

          <Typography className="text-2xl font-semibold">
            {card.value}
          </Typography>
        </div>
      ))}
    </div>
  );
}
