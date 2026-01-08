"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export default function NavMenuToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button variant="ghost" size="icon" className="border border-gray-400 rounded-md hover:bg-accent hover:text-accent-foreground" onClick={toggleSidebar}>
      <Menu />
    </Button>
  );
}
