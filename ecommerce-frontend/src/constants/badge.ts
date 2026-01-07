import { OrderStatus } from "@/services/orders/types";
import { ProductStatus } from "@/services/products/types";
import { CouponStatus } from "@/services/coupons/types";
import { ContactStatus } from "@/services/contacts/types";

import { BadgeVariantProps } from "@/components/ui/badge";

export const OrderBadgeVariants: Record<OrderStatus, BadgeVariantProps> = {
  pending: "warning",
  processing: "processing",
  shipped: "success",
  delivered: "success",
  cancelled: "destructive",
};

export const ProductBadgeVariants: Record<ProductStatus | "draft", BadgeVariantProps> = {
  selling: "success",
  "out-of-stock": "destructive",
  draft: "warning",
};

export const CouponBadgeVariants: Record<CouponStatus, BadgeVariantProps> = {
  active: "success",
  expired: "destructive",
};

export const ContactBadgeVariants: Record<ContactStatus, BadgeVariantProps> = {
  read: "success",
  unread: "warning",
};

export const CategoryBadgeVariants: Record<"active" | "inactive", BadgeVariantProps> = {
  active: "success",
  inactive: "destructive",
};
