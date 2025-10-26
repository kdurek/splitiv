import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import {
  CircleDollarSignIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { NotificationPrompt } from "@/components/notification-prompt";
import { SelectGroup } from "@/components/select-group";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const navItems = [
  { name: "Główna", href: "/", icon: HomeIcon },
  { name: "Wydatki", href: "/expenses", icon: CircleDollarSignIcon },
  { name: "Dodaj", href: "/expenses/create", icon: PlusIcon },
  { name: "Ustawienia", href: "/settings", icon: SettingsIcon },
];

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...orpc.auth.getCurrentUser.queryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: "/login" });
    }

    // re-return to update type as non-null for child routes
    return { user };
  },
});

function RouteComponent() {
  const getCurrentUserQuery = useQuery(orpc.auth.getCurrentUser.queryOptions());
  const { pathname } = useLocation();

  return (
    <>
      <div className="relative mx-auto max-w-lg overflow-y-auto px-4 pt-4 pb-21">
        {getCurrentUserQuery.data?.activeGroupId ? <Outlet /> : <SelectGroup />}
      </div>
      <nav className="fixed right-1 bottom-1 left-1 z-40 mx-auto flex h-16 max-w-lg items-center justify-between rounded-xl border bg-background shadow-sm">
        {navItems.map((item) => (
          <Link
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-center text-xs",
              pathname === item.href
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            key={item.href}
            to={item.href}
          >
            <item.icon />
            {item.name}
          </Link>
        ))}
      </nav>
      <NotificationPrompt />
    </>
  );
}
