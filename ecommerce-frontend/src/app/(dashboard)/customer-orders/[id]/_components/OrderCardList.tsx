"use client";

import { format } from "date-fns";
import { IoLocationOutline, IoCallOutline, IoCardOutline, IoTimeOutline, IoCubeOutline } from "react-icons/io5";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Typography from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/helpers/formatAmount";
import { OrderBadgeVariants } from "@/constants/badge";
import { OrderStatus } from "@/services/orders/types";
import { CustomerOrder } from "@/services/customers/types";
import { changeOrderStatus } from "@/actions/orders/changeOrderStatus";
import { useAuthorization } from "@/hooks/use-authorization";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type OrderCardListProps = {
  orders: CustomerOrder[];
};

export default function OrderCardList({ orders }: OrderCardListProps) {
  const { hasPermission } = useAuthorization();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const canChangeStatus = hasPermission("orders", "canChangeStatus");

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await changeOrderStatus(orderId, newStatus);

      if ("dbError" in result) {
        toast.error(result.dbError);
      } else {
        toast.success("Order status updated successfully.", { position: "top-center" });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
    });
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Typography variant="h4" className="font-semibold">
                  Invoice #{order.invoice_no}
                </Typography>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IoTimeOutline className="h-4 w-4" />
                  <span>
                    {format(order.order_time, "PP")} {format(order.order_time, "p")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={OrderBadgeVariants[order.status]}
                  className="text-xs capitalize"
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* FirstName and LastName */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                    First Name
                  </Typography>
                  <Typography>
                    {order.customers?.firstName || "—"}
                  </Typography>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                    Last Name
                  </Typography>
                  <Typography>
                    {order.customers?.lastName || "—"}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Company and Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                    Company
                  </Typography>
                  <Typography>
                    {order.customers?.company || "—"}
                  </Typography>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IoLocationOutline className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                    Shipping Address
                  </Typography>
                  <Typography className="break-words">
                    {order.customers?.address || "—"}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Phone and Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <IoCallOutline className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                    Phone
                  </Typography>
                  <Typography>{order.customers?.phone || "—"}</Typography>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IoCardOutline className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                    Payment Method
                  </Typography>
                  <Typography className="capitalize">
                    {order.payment_method}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Total Amount and Status Change */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                    Total Amount
                  </Typography>
                  <Typography variant="h4" className="font-semibold text-primary">
                    {formatAmount(order.total_amount)}
                  </Typography>
                </div>
              </div>
              {canChangeStatus && (
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                      Status
                    </Typography>
                    <Select
                      disabled={isPending}
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value as OrderStatus)
                      }
                    >
                      <SelectTrigger className="capitalize min-w-32">
                        <SelectValue placeholder={order.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <IoCubeOutline className="h-5 w-5 text-muted-foreground" />
                  <Typography variant="h4" className="font-semibold">
                    Products
                  </Typography>
                </div>
                <div className="space-y-3">
                  {order.order_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0">
                        <Typography variant="p" className="font-medium mb-1">
                          {item.products.name}
                        </Typography>
                        {item.products.sku && (
                          <Typography variant="p" className="text-xs text-muted-foreground">
                            SKU: {item.products.sku}
                          </Typography>
                        )}
                      </div>
                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-center min-w-[60px]">
                          <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                            Quantity
                          </Typography>
                          <Typography variant="p" className="font-semibold">
                            {item.quantity}
                          </Typography>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                            Unit Price
                          </Typography>
                          <Typography variant="p" className="font-semibold">
                            {formatAmount(item.unit_price)}
                          </Typography>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <Typography variant="p" className="text-xs text-muted-foreground mb-1">
                            Subtotal
                          </Typography>
                          <Typography variant="p" className="font-semibold text-primary">
                            {formatAmount(item.subtotal || item.quantity * item.unit_price)}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

