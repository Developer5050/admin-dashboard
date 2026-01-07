"use client";

import { format } from "date-fns";
import Image from "next/image";
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
import { getImageUrl } from "@/helpers/getImageUrl";
import { formatPaymentMethod } from "@/helpers/formatPaymentMethod";
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

          <CardContent className="space-y-6 mt-4">
            {/* FirstName and LastName */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                    First Name
                  </Typography>
                  <Typography className="text-sm font-medium">
                    {order.customers?.firstName || "—"}
                  </Typography>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                    Last Name
                  </Typography>
                  <Typography className="text-sm font-medium">
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
                  <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                    Company
                  </Typography>
                  <Typography className="text-sm font-medium">
                    {order.customers?.company || "—"}
                  </Typography>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IoLocationOutline className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                    Shipping Address
                  </Typography>
                  <Typography className="text-sm font-medium break-words">
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
                  <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                    Phone
                  </Typography>
                  <Typography className="text-sm font-medium">{order.customers?.phone || "—"}</Typography>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IoCardOutline className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                    Payment Method
                  </Typography>
                  <Typography className="text-sm font-medium">
                    {formatPaymentMethod(order.payment_method)}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Total Amount and Status Change */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
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
                    <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
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
                        <SelectItem value="shipped">Shipped</SelectItem>
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
                  {order.order_items.map((item, index) => {
                    const productImage = item.products.images && item.products.images.length > 0 
                      ? getImageUrl(item.products.images[0]) 
                      : null;
                    
                    return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {productImage ? (
                          productImage.startsWith("data:image/") ? (
                            <img
                              src={productImage}
                              alt={item.products.name || "Product image"}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <Image
                              src={productImage}
                              alt={item.products.name || "Product image"}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <IoCubeOutline className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Typography variant="p" className="font-semibold text-sm mb-1">
                            {item.products.name}
                          </Typography>
                          {item.products.sku && (
                            <Typography variant="p" className="text-xs text-muted-foreground font-medium">
                              SKU: {item.products.sku}
                            </Typography>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-center min-w-[60px]">
                          <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                            Quantity
                          </Typography>
                          <Typography variant="p" className="text-sm font-semibold">
                            {item.quantity}
                          </Typography>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                            Unit Price
                          </Typography>
                          <Typography variant="p" className="text-sm font-semibold">
                            {formatAmount(item.unit_price)}
                          </Typography>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <Typography variant="p" className="text-xs font-semibold text-foreground mb-1.5">
                            Subtotal
                          </Typography>
                          <Typography variant="p" className="text-sm font-semibold text-primary">
                            {formatAmount(item.subtotal || item.quantity * item.unit_price)}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

