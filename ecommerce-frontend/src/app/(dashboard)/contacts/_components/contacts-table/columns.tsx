import Link from "next/link";
import { ZoomIn, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";

import { TooltipWrapper } from "@/components/shared/table/TableActionTooltip";
import { TableActionAlertDialog } from "@/components/shared/table/TableActionAlertDialog";
import { ContactBadgeVariants } from "@/constants/badge";
import { SkeletonColumn } from "@/types/skeleton";
import { Contact } from "@/services/contacts/types";
import { format } from "date-fns";

import { deleteContact } from "@/actions/contacts/deleteContact";
import { HasPermission } from "@/hooks/use-authorization";

const handleDemoDelete = () => {
  toast.error("Sorry, this feature is not allowed in demo mode", {
    position: "top-center",
  });
};

export const getColumns = ({
  hasPermission,
}: {
  hasPermission: HasPermission;
}) => {
  const columns: ColumnDef<Contact>[] = [
    {
      header: "name",
      cell: ({ row }) => (
        <Typography className="capitalize block truncate">
          {row.original.name}
        </Typography>
      ),
    },
    {
      header: "email",
      cell: ({ row }) => (
        <Typography className="block max-w-52 truncate">
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
      header: "subject",
      cell: ({ row }) => (
        <Typography className="block max-w-52 truncate">
          {row.original.subject || "—"}
        </Typography>
      ),
    },
    {
      header: "message",
      cell: ({ row }) => (
        <Typography className="block max-w-64 truncate">
          {row.original.message}
        </Typography>
      ),
    },
    {
      header: "date",
      cell: ({ row }) => format(new Date(row.original.created_at), "PP"),
    },
    {
      header: "status",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <Badge
            variant={ContactBadgeVariants[status]}
            className="flex-shrink-0 text-xs capitalize"
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  columns.splice(7, 0, {
    header: () => <span className="block text-center">actions</span>,
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <TooltipWrapper content="View Contact">
            <Button
              size="icon"
              asChild
              variant="ghost"
              className="text-foreground"
            >
              <Link href={`/contacts/${row.original.id}`}>
                <ZoomIn className="size-5" />
              </Link>
            </Button>
          </TooltipWrapper>

          {hasPermission("contacts", "canDelete") && (
            <TooltipWrapper content="Delete Contact">
              <Button
                onClick={handleDemoDelete}
                variant="ghost"
                size="icon"
                className="text-foreground"
              >
                <Trash2 className="size-5" />
              </Button>
            </TooltipWrapper>

            // <TableActionAlertDialog
            //   title={`Delete Contact from ${row.original.name}?`}
            //   description="This action cannot be undone. This will permanently delete the contact submission from the database."
            //   tooltipContent="Delete Contact"
            //   actionButtonText="Delete Contact"
            //   toastSuccessMessage={`Contact from "${row.original.name}" deleted successfully!`}
            //   queryKey="contacts"
            //   action={() => deleteContact(row.original.id)}
            // >
            //   <Trash2 className="size-5" />
            // </TableActionAlertDialog>
          )}
        </div>
      );
    },
  });

  return columns;
};

export const skeletonColumns: SkeletonColumn[] = [
  {
    header: "name",
    cell: <Skeleton className="w-28 h-8" />,
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
    header: "subject",
    cell: <Skeleton className="w-32 h-8" />,
  },
  {
    header: "message",
    cell: <Skeleton className="w-48 h-8" />,
  },
  {
    header: "date",
    cell: <Skeleton className="w-20 h-8" />,
  },
  {
    header: "status",
    cell: <Skeleton className="w-24 h-8" />,
  },
  {
    header: "actions",
    cell: <Skeleton className="w-20 h-8" />,
  },
];

