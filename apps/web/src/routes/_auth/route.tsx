import { authClient } from "@repo/auth/auth-client";
import { authQueryOptions } from "@repo/auth/tanstack/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  CheckIcon,
  HomeIcon,
  ReceiptIcon,
  PlusCircleIcon,
  HandCoinsIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";

import { NotificationBell } from "~/components/notification-bell";
import { PushPermissionBanner } from "~/components/push-permission-banner";
import { ThemeToggle } from "~/components/theme-toggle";
import { UserAvatar } from "~/components/user-avatar";
import { setActiveGroupMutationOptions } from "~/server/groups/mutations";
import { groupsQueryOptions } from "~/server/groups/queries";
import { unreadNotificationCountQueryOptions } from "~/server/notifications/queries";

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
    void context.queryClient.prefetchQuery(unreadNotificationCountQueryOptions());
    void context.queryClient.prefetchQuery(groupsQueryOptions());
    return { user };
  },
});

function UserDropdown() {
  const { data: user } = useSuspenseQuery(authQueryOptions());
  const { data: groupsData } = useSuspenseQuery(groupsQueryOptions());
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();

  if (!user) return null;

  const { currentGroup, userGroups } = groupsData;

  const switchGroupMutation = useMutation({
    ...setActiveGroupMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Zmieniono aktywną grupę");
      navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error("Nie udało się zmienić grupy", { description: error.message });
    },
  });

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onResponse: async () => {
          queryClient.setQueryData(authQueryOptions().queryKey, null);
          await router.invalidate();
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="cursor-pointer rounded-lg ring-offset-background transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        }
      >
        <UserAvatar name={user.name} image={user.image} size="md" shape="square" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <UserAvatar name={user.name} image={user.image} size="md" shape="square" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        {userGroups.length > 0 && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Grupy</DropdownMenuLabel>
              {userGroups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  disabled={switchGroupMutation.isPending}
                  onClick={() => {
                    if (group.id !== currentGroup?.id) switchGroupMutation.mutate(group.id);
                  }}
                >
                  {group.name}
                  {group.id === currentGroup?.id && <CheckIcon className="ml-auto size-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/settings" />}>
            <SettingsIcon />
            Ustawienia
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOutIcon />
            Wyloguj
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          <NotificationBell />
          <UserDropdown />
        </div>
      </header>

      <PushPermissionBanner />

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
