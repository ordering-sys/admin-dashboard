"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="flex items-center gap-2 text-sm hover:text-amber-200 transition-colors"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
