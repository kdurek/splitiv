import "@tanstack/react-start/server-only";
import { db } from "@repo/db";
import webPush from "web-push";

import { deletePushSubscriptionsByEndpoints, getPushSubscriptionsForUsers } from "./handlers";

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  notificationId?: string;
}

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!subject || !publicKey || !privateKey) {
    console.warn("[push] VAPID env vars not set — push disabled");
    return false;
  }
  webPush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return;
  if (!ensureVapid()) return;

  const subs = await getPushSubscriptionsForUsers(db, userIds);
  if (subs.length === 0) return;

  const results = await Promise.allSettled(
    subs.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      ),
    ),
  );

  const staleEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number };
      if (err.statusCode === 410 || err.statusCode === 404) {
        staleEndpoints.push(subs[i].endpoint);
      } else {
        console.error("[push] send failed:", result.reason);
      }
    }
  });

  if (staleEndpoints.length > 0) {
    await deletePushSubscriptionsByEndpoints(db, staleEndpoints);
  }
}
