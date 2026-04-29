import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { pl } from "date-fns/locale";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { toast } from "sonner";

import {
  markAllNotificationsReadMutationOptions,
  markNotificationReadMutationOptions,
} from "~/server/notifications/mutations";
import {
  notificationsQueryOptions,
  unreadNotificationCountQueryOptions,
} from "~/server/notifications/queries";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  expenseId: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export const Route = createFileRoute("/_auth/notifications")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notificationsQueryOptions()),
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery(notificationsQueryOptions()) as {
    data: NotificationRow[];
  };
  const { data: unreadData } = useQuery(unreadNotificationCountQueryOptions());
  const unreadCount = unreadData?.count ?? 0;

  const markReadMutation = useMutation({
    ...markNotificationReadMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    ...markAllNotificationsReadMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Wszystkie oznaczone jako przeczytane");
    },
    onError: () => {
      toast.error("Nie udało się oznaczyć powiadomień");
    },
  });

  const handleClick = async (notif: {
    id: string;
    expenseId: string | null;
    readAt: Date | null;
  }) => {
    if (!notif.readAt) {
      await markReadMutation.mutateAsync(notif.id);
    }

    if (notif.expenseId) {
      void navigate({ to: "/expenses/$expenseId", params: { expenseId: notif.expenseId } });
    } else {
      toast.info("Wydatek został usunięty.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Powiadomienia</h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheckIcon className="mr-1.5 size-3.5" />
            Oznacz wszystkie
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <BellIcon className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Brak powiadomień.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => {
            const isUnread = !notif.readAt;
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                disabled={markReadMutation.isPending}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/50",
                  isUnread && "border-primary/20 bg-primary/5",
                )}
              >
                <BellIcon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    isUnread ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm",
                      isUnread ? "font-semibold" : "font-medium text-muted-foreground",
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notif.body}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDistanceToNowStrict(new Date(notif.createdAt), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
