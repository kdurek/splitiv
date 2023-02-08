import Layout from "components/Layout/Layout";

import type { ReactNode } from "react";

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  return <Layout>{children}</Layout>;
}
