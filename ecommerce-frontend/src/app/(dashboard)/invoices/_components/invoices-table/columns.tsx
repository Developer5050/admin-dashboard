import Link from "next/link";
import { ZoomIn } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { formatAmount } from "@/helpers/formatAmount";
import { formatPaymentMethod } from "@/helpers/formatPaymentMethod";

import { Order } from "@/services/orders/types";
import { SkeletonColumn } from "@/types/skeleton";
import { PrintInvoiceButton } from "@/app/(dashboard)/orders/_components/orders-table/PrintInvoiceButton";
import { HasPermission } from "@/hooks/use-authorization";

export const getColumns = ({
  hasPermission,
}: {
  hasPermission: HasPermission;
}) => {
  const columns: ColumnDef<Order>[] = [
    {
      header: "invoice no",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.invoice_no}</span>
      ),
    },
    {
      header: "customer name",
      cell: ({ row }) => {
        const firstName = row.original.customers?.firstName || "";
        const lastName = row.original.customers?.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim() || "-";
        return (
          <span className="block max-w-48 truncate capitalize">
            {fullName}
          </span>
        );
      },
    },
    {
      header: "method",
      cell: ({ row }) => (
        <span>{formatPaymentMethod(row.original.payment_method)}</span>
      ),
    },
    {
      header: "amount",
      cell: ({ row }) => formatAmount(row.original.total_amount),
    },
    {
      header: "date",
      cell: ({ row }) => {
        const date = row.original.order_time
          ? new Date(row.original.order_time)
          : null;
        return date ? (
          <span className="text-sm">{format(date, "PP")}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      header: "action",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            {hasPermission("orders", "canPrint") && (
              <PrintInvoiceButton orderId={row.original.id} />
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground"
                  asChild
                >
                  <Link href={`/invoices/${row.original.id}`}>
                    <ZoomIn className="size-5" />
                  </Link>
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>View Invoice</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return columns;
};

export const skeletonColumns: SkeletonColumn[] = [
  {
    header: "invoice no",
    cell: <Skeleton className="w-24 h-8" />,
  },
  {
    header: "customer name",
    cell: <Skeleton className="w-32 h-8" />,
  },
  {
    header: "method",
    cell: <Skeleton className="w-14 h-8" />,
  },
  {
    header: "amount",
    cell: <Skeleton className="w-16 h-8" />,
  },
  {
    header: "date",
    cell: <Skeleton className="w-24 h-8" />,
  },
  {
    header: "action",
    cell: <Skeleton className="w-20 h-8" />,
  },
];
