import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Switch } from "@repo/ui/components/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  getPushSupport,
  subscribeToPush,
  subscriptionToPayload,
  unsubscribeFromPush,
  getSubscription,
} from "~/lib/push-client";
import {
  subscribePushMutationOptions,
  unsubscribePushMutationOptions,
} from "~/server/notifications/mutations";
import { pushSubscriptionStatusQueryOptions } from "~/server/notifications/queries";

export function PushToggle() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(pushSubscriptionStatusQueryOptions());
  const isSubscribed = data?.isSubscribed ?? false;

  const [permission, setPermission] = React.useState<NotificationPermission>("default");

  React.useEffect(() => {
    const { supported } = getPushSupport();
    if (!supported) return;

    setPermission(Notification.permission);

    navigator.permissions
      ?.query({ name: "notifications" as PermissionName })
      .then((status) => {
        const onChange = () => setPermission(Notification.permission);
        status.addEventListener("change", onChange);
      })
      .catch(() => {});
  }, []);

  const subscribeMutation = useMutation(subscribePushMutationOptions());
  const unsubscribeMutation = useMutation(unsubscribePushMutationOptions());
  const [actionPending, setActionPending] = React.useState(false);

  const handleToggle = async (checked: boolean) => {
    setActionPending(true);
    try {
      if (checked) {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") return;

        const sub = await subscribeToPush();
        await subscribeMutation.mutateAsync(subscriptionToPayload(sub));
        await queryClient.invalidateQueries({ queryKey: ["push-subscription-status"] });
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.success("Powiadomienia włączone");
      } else {
        const sub = await getSubscription();
        if (sub) {
          await unsubscribeMutation.mutateAsync(sub.endpoint);
          await unsubscribeFromPush();
        }
        await queryClient.invalidateQueries({ queryKey: ["push-subscription-status"] });
        toast.success("Powiadomienia wyłączone");
      }
    } catch {
      toast.error(
        checked ? "Nie udało się włączyć powiadomień" : "Nie udało się wyłączyć powiadomień",
      );
    } finally {
      setActionPending(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>
    );
  }

  const denied = permission === "denied";
  const busy = actionPending || subscribeMutation.isPending || unsubscribeMutation.isPending;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor="push-toggle" className="font-medium">
          Powiadomienia push
        </Label>
        {denied && (
          <p className="text-xs text-muted-foreground">
            Odblokuj powiadomienia w ustawieniach przeglądarki.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {busy && <Loader2Icon className="size-4 animate-spin text-muted-foreground" />}
        <Switch
          id="push-toggle"
          checked={isSubscribed && permission === "granted"}
          onCheckedChange={handleToggle}
          disabled={denied || busy}
        />
      </div>
    </div>
  );
}
