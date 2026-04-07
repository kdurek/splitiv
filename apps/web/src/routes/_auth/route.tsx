import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { HomeIcon, ReceiptIcon, PlusCircleIcon, SettingsIcon } from "lucide-react";

import { ThemeToggle } from "~/components/theme-toggle";

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}> = [
  { to: "/", label: "Główna", icon: HomeIcon, exact: true },
  { to: "/expenses", label: "Wydatki", icon: ReceiptIcon },
  { to: "/expenses/create", label: "Dodaj", icon: PlusCircleIcon },
  { to: "/settings", label: "Ustawienia", icon: SettingsIcon },
];

export const Route = createFileRoute("/_auth")({
  component: AppLayout,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
});

function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
        <span className="text-lg font-semibold tracking-tight">Splitiv</span>
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed right-0 bottom-0 left-0 z-10 flex h-16 items-center border-t bg-background">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const active = exact
            ? location.pathname === to
            : location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
