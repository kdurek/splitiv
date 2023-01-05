import { ReactNode } from "react";

import Layout from "components/Layout/Layout";

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  return <Layout>{children}</Layout>;
}
