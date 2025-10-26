import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { setDefaultOptions } from "date-fns";
import { pl } from "date-fns/locale";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { orpc } from "@/utils/orpc";
import "../index.css";

export type RouterAppContext = {
  orpc: typeof orpc;
  queryClient: QueryClient;
};

setDefaultOptions({
  locale: pl,
});

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  beforeLoad: ({ context }) => {
    context.queryClient.prefetchQuery(orpc.auth.getCurrentUser.queryOptions());
  },
  head: () => ({
    meta: [
      {
        title: "Splitiv",
      },
      {
        name: "description",
        content: "Expense management",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
    </>
  );
}
