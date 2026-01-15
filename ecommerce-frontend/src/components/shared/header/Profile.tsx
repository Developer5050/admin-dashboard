"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Settings, LogOut, LayoutGrid, User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function Profile() {
  const { profile, user } = useUser();

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex ml-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar>
            <AvatarImage
              src={profile?.image_url ?? undefined}
              alt={profile?.name ?? "User avatar"}
              className="object-cover object-center"
            />
            <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          alignOffset={3}
          className="flex flex-col w-48"
          align="end"
        >
          <div className="flex items-center px-3 py-2">
            <User className="mr-3 size-5" />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold leading-tight">
                {profile?.name || "User"}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                {user?.email || ""}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-border ml-1 mr-1 h-[0.5px]" />
          <DropdownMenuItem asChild>
            <Link
              href="/"
              className="w-full justify-start py-2 pl-3 pr-8 tracking-wide !cursor-pointer"
            >
              <LayoutGrid className="mr-3 size-4" /> <span className="text-[13px]">Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/edit-profile"
              className="w-full justify-start py-3.5 pl-3 pr-7 tracking-wide !cursor-pointer"
            >
              <Settings className="mr-3 size-4" /> <span className="text-[13px]">Edit Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border ml-1 mr-1 h-[0.5px]" />

          <form action="/auth/sign-out" method="post">
            <DropdownMenuItem asChild>
              <button
                type="submit"
                className="w-full justify-start py-3.5 pl-4 pr-8 tracking-wide !cursor-pointer"
              >
                <LogOut className="mr-3 size-4" /> <span className="text-[13px]">Log Out</span>
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
