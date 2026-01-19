import Link from "next/link";
import { ZoomIn } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectItem } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatAmount } from "@/helpers/formatAmount";
import { formatPaymentMethod } from "@/helpers/formatPaymentMethod";

import { TableSelect } from "@/components/shared/table/TableSelect";
import { OrderBadgeVariants } from "@/constants/badge";
import { Order, OrderStatus } from "@/services/orders/types";
import { SkeletonColumn } from "@/types/skeleton";

import { changeOrderStatus } from "@/actions/orders/changeOrderStatus";
import { PrintInvoiceButton } from "./PrintInvoiceButton";
import { HasPermission } from "@/hooks/use-authorization";

export const getColumns = ({
  hasPermission,
}: {
  hasPermission: HasPermission;
}) => {
  const columns: ColumnDef<Order>[] = [
    {
      header: "Order No",
      cell: ({ row }) => row.original.masked_order_id || row.original.invoice_no,
    },
    {
      header: "Customer Name",
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
      header: "Payment Method",
      cell: ({ row }) => (
        <span>{formatPaymentMethod(row.original.payment_method)}</span>
      ),
    },
    {
      header: "amount",
      cell: ({ row }) => formatAmount(row.original.total_amount),
    },
    {
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <Badge
            variant={OrderBadgeVariants[status]}
            className="flex-shrink-0 text-xs capitalize rounded-xl"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: "Action",
      cell: ({ row }) => {
        if (!hasPermission("orders", "canChangeStatus")) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <div className="px-2">
            <TableSelect
              value={row.original.status}
              toastSuccessMessage="Order status updated successfully."
              queryKey="orders"
              onValueChange={(value) =>
                changeOrderStatus(row.original.id, value as OrderStatus)
              }
            >
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </TableSelect>
          </div>
        );
      },
    },
    {
      header: "Invoice",
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
                  <Link href={`/orders/${row.original.id}`}>
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
    header: "Order No",
    cell: <Skeleton className="w-20 h-8" />,
  },
  {
    header: "full name",
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
    header: "status",
    cell: <Skeleton className="w-16 h-8" />,
  },
  {
    header: "action",
    cell: <Skeleton className="w-24 h-10" />,
  },
  {
    header: "invoice",
    cell: <Skeleton className="w-20 h-8" />,
  },
];
