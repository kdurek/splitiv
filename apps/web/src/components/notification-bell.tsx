import { cn } from "@repo/ui/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BellIcon } from "lucide-react";
import { useEffect } from "react";

import { unreadNotificationCountQueryOptions } from "~/server/notifications/queries";

export function NotificationBell() {
  const queryClient = useQueryClient();
  const { data } = useQuery(unreadNotificationCountQueryOptions());
  const unread = data?.count ?? 0;

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if ((event.data as { type?: string })?.type === "PUSH_RECEIVED") {
        void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [queryClient]);

  return (
    <Link
      to="/notifications"
      aria-label="Powiadomienia"
      className="relative inline-flex size-9 items-center justify-center rounded-md border border-input bg-background text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <BellIcon className="h-[1.2rem] w-[1.2rem]" />
      {unread > 0 && (
        <span
          className={cn(
            "text-destructive-foreground absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold",
          )}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
