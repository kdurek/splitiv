import { Button } from "@repo/ui/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BellIcon, Loader2Icon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { toast } from "sonner";

import {
  getSubscription,
  getPushSupport,
  subscribeToPush,
  subscriptionToPayload,
} from "~/lib/push-client";
import { subscribePushMutationOptions } from "~/server/notifications/mutations";

const DISMISSED_KEY = "splitiv:push-prompt-dismissed";

export function PushPermissionBanner() {
  const [visible, setVisible] = React.useState(false);
  const [isIosHint, setIsIosHint] = React.useState(false);
  const [enabling, setEnabling] = React.useState(false);
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    ...subscribePushMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["push-subscription-status"] });
    },
  });

  React.useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const { supported, isIos, isStandalone } = getPushSupport();

    if (!supported) return;

    if (isIos && !isStandalone) {
      setIsIosHint(true);
      setVisible(true);
      return;
    }

    if (Notification.permission === "denied") return;

    if (Notification.permission === "granted") {
      // Permission granted but may not have an active subscription — check async
      getSubscription().then((sub) => {
        if (!sub) setVisible(true);
      });
      return;
    }

    // permission === "default"
    setVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  const handleEnable = async () => {
    setEnabling(true);
    try {
      // If permission already granted, skip the prompt
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        handleDismiss();
        return;
      }

      const sub = await subscribeToPush();
      await subscribeMutation.mutateAsync(subscriptionToPayload(sub));
      toast.success("Powiadomienia włączone");
      handleDismiss();
    } catch {
      toast.error("Nie udało się włączyć powiadomień");
    } finally {
      setEnabling(false);
    }
  };

  const isPending = enabling || subscribeMutation.isPending;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="push-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
            <BellIcon className="size-4 shrink-0 text-muted-foreground" />
            <p className="flex-1 text-sm text-muted-foreground">
              {isIosHint
                ? "Aby otrzymywać powiadomienia, dodaj aplikację do ekranu głównego."
                : "Włącz powiadomienia, aby otrzymywać informacje o nowych wydatkach."}
            </p>
            {!isIosHint && (
              <Button size="sm" onClick={handleEnable} disabled={isPending} className="shrink-0">
                {isPending && <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />}
                Włącz
              </Button>
            )}
            <button
              onClick={handleDismiss}
              disabled={isPending}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              aria-label="Zamknij"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
