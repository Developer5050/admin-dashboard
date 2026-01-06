import Link from "next/link";
import { ZoomIn, PenSquare, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Typography from "@/components/ui/typography";

import { SheetTooltip } from "@/components/shared/table/TableActionTooltip";
import { TableActionAlertDialog } from "@/components/shared/table/TableActionAlertDialog";
import CustomerFormSheet from "../form/CustomerFormSheet";
import { Customer } from "@/services/customers/types";
import { SkeletonColumn } from "@/types/skeleton";
import { TooltipWrapper } from "@/components/shared/table/TableActionTooltip";

import { editCustomer } from "@/actions/customers/editCustomer";
import { deleteCustomer } from "@/actions/customers/deleteCustomer";
import { HasPermission } from "@/hooks/use-authorization";

export const getColumns = ({
  hasPermission,
  currentPage = 1,
  limit = 10,
}: {
  hasPermission: HasPermission;
  currentPage?: number;
  limit?: number;
}) => {
  const columns: ColumnDef<Customer>[] = [
    {
      header: "S.No",
      cell: ({ row }) => {
        const serialNumber = (currentPage - 1) * limit + row.index + 1;
        return (
          <Typography>
            {serialNumber}
          </Typography>
        );
      },
    },
    {
      header: "first name",
      cell: ({ row }) => (
        <Typography>
          {row.original.firstName || "—"}
        </Typography>
      ),
    },
    {
      header: "last name",
      cell: ({ row }) => (
        <Typography>
          {row.original.lastName || "—"}
        </Typography>
      ),
    },
    {
      header: "email",
      cell: ({ row }) => (
        <Typography className="block max-w-52 xl:max-w-60 truncate">
          {row.original.email}
        </Typography>
      ),
    },
    {
      header: () => <span className="block text-center">phone</span>,
      id: "phone",
      cell: ({ row }) => (
        <Typography className="block text-center">
          {row.original.phone || "—"}
        </Typography>
      ),
    },
    {
      header: () => <span className="block text-center">actions</span>,
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-1">
            <TooltipWrapper content="View Customer Orders">
              <Button
                size="icon"
                asChild
                variant="ghost"
                className="text-foreground"
              >
                <Link href={`/customer-orders/${row.original.id}`}>
                  <ZoomIn className="size-5" />
                </Link>
              </Button>
            </TooltipWrapper>

            {hasPermission("customers", "canEdit") && (
              <CustomerFormSheet
                key={row.original.id}
                title="Update Customers"
                description="Update necessary customer information here"
                submitButtonText="Update Customer"
                actionVerb="updated"
                initialData={{
                  firstName: row.original.firstName || "",
                  lastName: row.original.lastName || "",
                  email: row.original.email,
                  phone: row.original.phone ?? "",
                }}
                action={(formData) => editCustomer(row.original.id, formData)}
              >
                <SheetTooltip content="Edit Customer">
                  <PenSquare className="size-5" />
                </SheetTooltip>
              </CustomerFormSheet>
            )}

            {hasPermission("customers", "canDelete") && (
              <TableActionAlertDialog
                title={`Delete ${row.original.firstName} ${row.original.lastName}?`}
                description="This action cannot be undone. This will permanently delete this customer and associated data from the database."
                tooltipContent="Delete Customer"
                actionButtonText="Delete Customer"
                toastSuccessMessage={`Customer "${row.original.firstName} ${row.original.lastName}" deleted successfully!`}
                queryKey="customers"
                action={() => deleteCustomer(row.original.id)}
              >
                <Trash2 className="size-5" />
              </TableActionAlertDialog>
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};

export const skeletonColumns: SkeletonColumn[] = [
  {
    header: "S.No",
    cell: <Skeleton className="w-10 h-8" />,
  },
  {
    header: "first name",
    cell: <Skeleton className="w-24 h-8" />,
  },
  {
    header: "last name",
    cell: <Skeleton className="w-24 h-8" />,
  },
  {
    header: "email",
    cell: <Skeleton className="w-32 h-8" />,
  },
  {
    header: "phone",
    cell: <Skeleton className="w-20 h-10" />,
  },
  {
    header: "actions",
    cell: <Skeleton className="w-24 h-8" />,
  },
];
