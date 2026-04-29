import { queryOptions } from "@tanstack/react-query";

import { getSubscription } from "~/lib/push-client";

import {
  $checkPushSubscription,
  $getNotifications,
  $getUnreadNotificationCount,
} from "./functions";

export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["notifications"],
    queryFn: ({ signal }) => $getNotifications({ signal }),
  });

export const unreadNotificationCountQueryOptions = () =>
  queryOptions({
    queryKey: ["notifications", "unread-count"],
    queryFn: ({ signal }) => $getUnreadNotificationCount({ signal }),
  });

/**
 * Client-only — checks browser PushSubscription AND verifies server ownership.
 * Never use in a loader.
 */
export const pushSubscriptionStatusQueryOptions = () =>
  queryOptions({
    queryKey: ["push-subscription-status"],
    queryFn: async () => {
      const sub = await getSubscription();
      if (!sub) return { isSubscribed: false, endpoint: null };
      const owned = await $checkPushSubscription({ data: { endpoint: sub.endpoint } });
      return { isSubscribed: owned, endpoint: sub.endpoint };
    },
  });
