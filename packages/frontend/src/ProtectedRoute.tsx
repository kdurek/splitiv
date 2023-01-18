import { useAuth0 } from "@auth0/auth0-react";
import { Box } from "@mantine/core";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) return null;

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Box>{children}</Box>;
}

export default ProtectedRoute;
