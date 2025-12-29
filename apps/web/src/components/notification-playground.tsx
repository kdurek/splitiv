import { env } from "@splitiv/env/web";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

export function NotificationPlayground() {
  const sendTestNotificationMutation = useMutation(
    orpc.pushSubscription.sendTestNotification.mutationOptions()
  );
  const createPushSubscriptionMutation = useMutation(
    orpc.pushSubscription.create.mutationOptions()
  );
  const deletePushSubscriptionMutation = useMutation(
    orpc.pushSubscription.delete.mutationOptions()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick = async () => {
    if (!registration) {
      toast.error("No SW registration available.");
      return;
    }
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(env.VITE_WEB_PUSH_PUBLIC_KEY),
    });
    createPushSubscriptionMutation.mutate({
      pushSubscription: sub,
    });
    setSubscription(sub);
    setIsSubscribed(true);
    toast.success("Web push subscribed!");
  };

  const unsubscribeButtonOnClick = async () => {
    if (!subscription) {
      toast.error("Web push not subscribed");
      return;
    }
    await subscription.unsubscribe();
    deletePushSubscriptionMutation.mutate({ endpoint: subscription.endpoint });
    setSubscription(null);
    setIsSubscribed(false);
    toast.success("Web push unsubscribed!");
  };

  const sendNotificationButtonOnClick = () => {
    if (!subscription) {
      toast.error("Web push not subscribed");
      return;
    }

    sendTestNotificationMutation.mutate({
      title: "Nowy wydatek",
      body: "Dodano wydatek w którym uczestniczysz",
    });
  };

  return (
    <div className="grid gap-2">
      <Button
        disabled={isSubscribed}
        onClick={subscribeButtonOnClick}
        type="button"
      >
        Subscribe
      </Button>
      <Button
        disabled={!isSubscribed}
        onClick={unsubscribeButtonOnClick}
        type="button"
      >
        Unsubscribe
      </Button>
      <Button
        disabled={!isSubscribed}
        onClick={sendNotificationButtonOnClick}
        type="button"
      >
        Send Notification
      </Button>
    </div>
  );
}
