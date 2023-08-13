"use client";

import { IconLogin } from "@tabler/icons-react";
import { signIn } from "next-auth/react";

import { Button } from "./ui/button";

export function LoginButton() {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/" })}>
      <IconLogin /> Zaloguj
    </Button>
  );
}
