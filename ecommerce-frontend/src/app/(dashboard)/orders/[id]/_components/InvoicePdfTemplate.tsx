import { FaBagShopping } from "react-icons/fa6";
import { format } from "date-fns";

import Typography from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { OrderDetails } from "@/services/orders/types";
import { OrderBadgeVariants } from "@/constants/badge";
import { formatPaymentMethod } from "@/helpers/formatPaymentMethod";
import { getDiscount } from "@/helpers/getDiscount";
import { companyInfo } from "@/constants/companyInfo";

export default function InvoicePdfTemplate({ order }: { order: OrderDetails }) {
  return (
    <Card
      id={`invoice-${order.invoice_no}`}
      className="text-black p-4 lg:p-20 border print:border-none bg-white rounded-lg print:rounded-none print:shadow-none"
      style={{ 
        width: "100%", 
        maxWidth: "930px", 
        margin: "0 auto",
        minHeight: "1123px"
      }}
    >
      <div className="flex justify-between gap-x-4 gap-y-6">
        <div className="flex flex-col">
          <Typography
            className="uppercase text-black mb-1.5 tracking-wide"
            variant="h2"
          >
            invoice
          </Typography>

          <div className="flex items-center gap-x-2">
            <Typography className="uppercase font-semibold text-xs text-black">
              status:
            </Typography>
            <Badge
              variant={OrderBadgeVariants[order.status]}
              className="flex-shrink-0 text-xs capitalize"
            >
              {order.status}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col text-sm gap-y-0.5 text-right text-black">
          <div className="flex items-center justify-end gap-x-1">
            <FaBagShopping className="size-6 text-primary flex-shrink-0" />
            <Typography component="span" variant="h2">
              {companyInfo.name}
            </Typography>
          </div>

          <Typography component="p">{companyInfo.address}</Typography>
          <Typography component="p">{companyInfo.phone}</Typography>
          <Typography component="p" className="break-words">
            {companyInfo.email}
          </Typography>
        </div>
      </div>

      <Separator className="my-6 bg-print-border" />

      <div className="flex justify-between gap-4 mb-10 text-black">
        <div>
          <Typography
            variant="p"
            component="h4"
            className="font-semibold uppercase mb-1 text-black"
          >
            date
          </Typography>

          <Typography className="text-sm">
            {format(order.order_time, "PPP")}
          </Typography>
        </div>

        <div>
          <Typography
            variant="p"
            component="h4"
            className="font-semibold uppercase mb-1 text-black"
          >
            invoice no
          </Typography>

          <Typography className="text-sm">#{order.invoice_no}</Typography>
        </div>

        <div className="text-right">
          <Typography
            variant="p"
            component="h4"
            className="font-semibold uppercase mb-1 text-black"
          >
            invoice to
          </Typography>

          <div className="flex flex-col text-sm gap-y-0.5">
            <Typography component="p">{order.customers.name}</Typography>
            <Typography component="p" className="break-words">
              {order.customers.email}
            </Typography>
            {order.customers.phone && (
              <Typography component="p">{order.customers.phone}</Typography>
            )}
            {order.customers.address && (
              <Typography component="p" className="max-w-80">
                {order.customers.address}
              </Typography>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden mb-10 text-black border-print-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b-print-border hover:bg-transparent">
              <TableHead className="uppercase h-10 whitespace-nowrap text-black">
                SR.
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-black">
                product title
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-center text-black">
                quantity
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-center text-black">
                item price
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-right text-black">
                amount
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {order.order_items.map((orderItem, index) => (
              <TableRow
                key={`order-item-${index}`}
                className="hover:bg-transparent border-b-print-border"
              >
                <TableCell className="py-3 font-normal text-black">
                  {index + 1}
                </TableCell>
                <TableCell className="py-3 px-6 font-normal text-black">
                  {orderItem.products.name}
                </TableCell>
                <TableCell className="py-3 text-center font-normal text-black">
                  {orderItem.quantity}
                </TableCell>
                <TableCell className="py-3 text-center font-normal text-black">
                  ${orderItem.unit_price.toFixed(2)}
                </TableCell>
                <TableCell className="font-semibold py-3 text-primary text-right text-black">
                  ${(orderItem.quantity * orderItem.unit_price).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg flex gap-4 justify-between md:flex-row px-2">
        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            payment method
          </Typography>

          <Typography className="text-base font-semibold tracking-wide text-black">
            {formatPaymentMethod(order.payment_method)}
          </Typography>
        </div>

        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            shipping cost
          </Typography>

          <Typography className="text-base capitalize font-semibold tracking-wide text-black">
            ${order.shipping_cost.toFixed(2)}
          </Typography>
        </div>

        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            discount
          </Typography>

          <Typography className="text-base capitalize font-semibold tracking-wide text-black">
            $
            {getDiscount({
              totalAmount: order.total_amount,
              shippingCost: order.shipping_cost,
              coupon: order.coupons,
            })}
          </Typography>
        </div>

        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            total amount
          </Typography>

          <Typography className="text-xl capitalize font-semibold tracking-wide text-primary">
            ${order.total_amount.toFixed(2)}
          </Typography>
        </div>
      </div>
    </Card>
  );
}
