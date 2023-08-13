"use client";

import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

import { Button } from "./ui/button";

export function LogoutButton() {
  return (
    <Button variant="outline" onClick={() => signOut()}>
      <IconLogout /> Wyloguj
    </Button>
  );
}
