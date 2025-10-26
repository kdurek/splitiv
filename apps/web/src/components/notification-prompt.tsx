"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

const base64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function NotificationPrompt() {
  const createPushSubscriptionMutation = useMutation(
    orpc.pushSubscription.create.mutationOptions()
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const VITE_WEB_PUSH_PUBLIC_KEY = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY;
    if (!VITE_WEB_PUSH_PUBLIC_KEY) {
      console.error("VITE_WEB_PUSH_PUBLIC_KEY is not set.");
      return;
    }

    const handleSubscribe = async (reg: ServiceWorkerRegistration) => {
      try {
        const pushSubscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(VITE_WEB_PUSH_PUBLIC_KEY),
        });
        await createPushSubscriptionMutation.mutateAsync({ pushSubscription });
        console.info("Web push subscribed!");
        toast.dismiss(); // Dismiss the notification prompt
      } catch (error) {
        console.error("Failed to subscribe to web push:", error);
        toast.error("Failed to enable notifications.");
      }
    };

    navigator.serviceWorker.ready
      .then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            !sub ||
            (sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000)
          ) {
            toast("Nie masz włączonych powiadomień", {
              duration: Number.POSITIVE_INFINITY,
              action: (
                <Button
                  className="ml-auto"
                  onClick={() => handleSubscribe(reg)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Włącz
                </Button>
              ),
            });
          }
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }, [createPushSubscriptionMutation]);

  return null;
}
