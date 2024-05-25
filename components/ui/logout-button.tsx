"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <>
      <DropdownMenuItem
        onClick={async () => {
          await signOut();
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </DropdownMenuItem>
    </>
  );
}
