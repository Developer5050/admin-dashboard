import { MdOutlineDashboard } from "react-icons/md";
import { LuUsers2 } from "react-icons/lu";
import { TbTruckDelivery } from "react-icons/tb";
import { RiCoupon2Line } from "react-icons/ri";
import { TbTag } from "react-icons/tb";
import { TbMessageCircle } from "react-icons/tb";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaFileInvoice } from "react-icons/fa";
import { UserRole } from "@/contexts/UserContext";

export type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  roles?: UserRole[]; // If undefined, accessible to all roles
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: <MdOutlineDashboard />,
    roles: ["admin"], // Admin only
  },
  {
    title: "Products",
    url: "/products",
    icon: <MdOutlineShoppingCart />,
    roles: ["admin"], // Admin only
  },
  {
    title: "Categories",
    url: "/categories",
    icon: <TbTag />,
    roles: ["admin"], // Admin only
  },
  {
    title: "Customers",
    url: "/customers",
    icon: <LuUsers2 />,
    roles: ["admin"], // Admin only
  },
  {
    title: "Orders",
    url: "/orders",
    icon: <TbTruckDelivery />,
    roles: ["admin"], // Admin only
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: <FaFileInvoice />,
    roles: ["admin"], // Admin only
  },
  {
    title: "Coupons",
    url: "/coupons",
    icon: <RiCoupon2Line />,
    roles: ["admin"], // Admin only
  },
  {
    title: "Contact",
    url: "/contacts",
    icon: <TbMessageCircle />,
    roles: ["admin"], // Admin only
  },
];
