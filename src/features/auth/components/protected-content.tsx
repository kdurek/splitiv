import { useSession } from "next-auth/react";

import { ActiveGroupProvider } from "features/group";

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

  return <ActiveGroupProvider>{children}</ActiveGroupProvider>;
}
