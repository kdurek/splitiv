"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "./ui/button";

export function LogoutButton() {
  return (
    <Button variant="outline" onClick={() => signOut()}>
      <LogOut className="mr-2" /> Wyloguj
    </Button>
  );
}
