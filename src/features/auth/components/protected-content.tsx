import { Box } from "@mantine/core";
import { useSession } from "next-auth/react";

import { LoginPlaceholder } from "./login-placeholder";

import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedContent({ children }: ProtectedRouteProps) {
  const { status } = useSession();

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return <LoginPlaceholder />;
  }

  return <Box>{children}</Box>;
}
