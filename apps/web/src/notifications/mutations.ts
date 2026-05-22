import { mutationOptions } from "@tanstack/react-query";

import {
  $markAllNotificationsRead,
  $markNotificationRead,
  $sendTestPushNotification,
  $subscribePush,
  $unsubscribePush,
} from "./functions";

export const markNotificationReadMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: string) => $markNotificationRead({ data: { id } }),
  });

export const markAllNotificationsReadMutationOptions = () =>
  mutationOptions({
    mutationFn: () => $markAllNotificationsRead(),
  });

export const subscribePushMutationOptions = () =>
  mutationOptions({
    mutationFn: (data: { endpoint: string; p256dh: string; auth: string }) =>
      $subscribePush({ data }),
  });

export const unsubscribePushMutationOptions = () =>
  mutationOptions({
    mutationFn: (endpoint: string) => $unsubscribePush({ data: { endpoint } }),
  });

export const sendTestPushNotificationMutationOptions = () =>
  mutationOptions({
    mutationFn: () => $sendTestPushNotification(),
  });
