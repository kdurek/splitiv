import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { HomeIcon, ReceiptIcon, PlusCircleIcon, HandCoinsIcon, SettingsIcon } from "lucide-react";

import { ThemeToggle } from "~/components/theme-toggle";

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { to: "/", label: "Główna", icon: HomeIcon },
  { to: "/expenses", label: "Wydatki", icon: ReceiptIcon },
  { to: "/expenses/create", label: "Dodaj", icon: PlusCircleIcon },
  { to: "/settle", label: "Rozlicz", icon: HandCoinsIcon },
];

export const Route = createFileRoute("/_auth")({
  component: AppLayout,
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: "/login" });
    }
    if (!user.activeOrganizationId && location.pathname !== "/group/select") {
      throw redirect({ to: "/group/select" });
    }
    return { user };
  },
});

function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Splitiv
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/settings"
            className="inline-flex size-9 items-center justify-center rounded-md border border-input bg-background text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Ustawienia</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <nav className="fixed right-0 bottom-0 left-0 z-10 flex h-[calc(4rem+env(safe-area-inset-bottom))] items-center border-t bg-background pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
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
