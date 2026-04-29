import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BellOffIcon, PlusIcon, RefreshCwIcon, SendIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PushToggle } from "~/components/push-toggle";
import { UserAvatar } from "~/components/user-avatar";
import { getPushSupport } from "~/lib/push-client";
import { addMemberByEmailMutationOptions } from "~/server/groups/mutations";
import { groupsQueryOptions } from "~/server/groups/queries";
import { sendTestPushNotificationMutationOptions } from "~/server/notifications/mutations";
import { pushSubscriptionStatusQueryOptions } from "~/server/notifications/queries";

export const Route = createFileRoute("/_auth/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    data: { currentGroup, currentGroupMembers, isOwner },
  } = useSuspenseQuery(groupsQueryOptions());
  const queryClient = useQueryClient();
  const [email, setEmail] = React.useState("");

  const addMemberMutation = useMutation({
    ...addMemberByEmailMutationOptions(),
    onSuccess: async () => {
      setEmail("");
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Pomyślnie dodano użytkownika do grupy");
    },
    onError: (error) => {
      toast.error("Nie udało się dodać użytkownika", { description: error.message });
    },
  });

  const handleAddMember = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email.trim()) return;
    addMemberMutation.mutate(email.trim());
  };

  return (
    <div className="flex flex-col gap-8 p-4 pt-6">
      {/* Group members — owner only */}
      {currentGroup && isOwner && (
        <section className="space-y-3">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Członkowie grupy
          </p>
          <div className="space-y-2">
            {currentGroupMembers.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
              >
                <UserAvatar name={m.name} image={m.image} size="md" shape="square" />
                <span className="text-sm font-medium">{m.name}</span>
              </div>
            ))}

            <form onSubmit={handleAddMember} className="flex gap-2 pt-1">
              <Input
                type="email"
                placeholder="Adres email użytkownika"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={addMemberMutation.isPending}
              />
              <Button
                type="submit"
                variant="outline"
                size="icon"
                disabled={addMemberMutation.isPending || !email.trim()}
              >
                <PlusIcon className="size-4" />
              </Button>
            </form>
          </div>
        </section>
      )}

      {/* Notifications */}
      <section className="space-y-3">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Powiadomienia
        </p>
        <div className="rounded-xl border-l-4 border-primary/40 bg-card p-5">
          <PushToggle />
        </div>
      </section>

      {/* Kitchensink — owner only */}
      {isOwner && <KitchensinkSection />}
    </div>
  );
}

const BANNER_DISMISSED_KEY = "splitiv:push-prompt-dismissed";

function KitchensinkSection() {
  const queryClient = useQueryClient();
  const [swStatus, setSwStatus] = React.useState<string>("checking…");
  const [permission, setPermission] = React.useState<NotificationPermission | "n/a">("n/a");
  const [bannerDismissed, setBannerDismissed] = React.useState(false);
  const [supported, setSupported] = React.useState(false);

  const { data: subData, refetch: refetchSub } = useQuery(pushSubscriptionStatusQueryOptions());

  const testPushMutation = useMutation({
    ...sendTestPushNotificationMutationOptions(),
    onSuccess: () => toast.success("Test push wysłany"),
    onError: (e) => toast.error("Błąd", { description: e.message }),
  });

  const readStatus = React.useCallback(async () => {
    const { supported: s } = getPushSupport();
    setSupported(s);
    if ("Notification" in window) setPermission(Notification.permission);
    setBannerDismissed(!!localStorage.getItem(BANNER_DISMISSED_KEY));
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length === 0) {
        setSwStatus("Brak rejestracji");
      } else {
        const controlled = !!navigator.serviceWorker.controller;
        setSwStatus(`${regs.length} reg. | controller: ${controlled ? "tak" : "nie"}`);
      }
    } else {
      setSwStatus("Nieobsługiwane");
    }
  }, []);

  React.useEffect(() => {
    void readStatus();
  }, [readStatus]);

  const handleRefresh = async () => {
    await refetchSub();
    await readStatus();
    void queryClient.invalidateQueries({ queryKey: ["push-subscription-status"] });
    toast.success("Odświeżono status");
  };

  const handleResetBanner = () => {
    localStorage.removeItem(BANNER_DISMISSED_KEY);
    setBannerDismissed(false);
    toast.success("Banner zresetowany — odśwież stronę");
  };

  return (
    <section className="space-y-3">
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        Kitchensink
      </p>
      <div className="space-y-4 rounded-xl border-l-4 border-muted bg-card p-5">
        {/* Status rows */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Push API</span>
            <Badge variant={supported ? "default" : "secondary"}>
              {supported ? "obsługiwane" : "brak"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Uprawnienie</span>
            <Badge
              variant={
                permission === "granted"
                  ? "default"
                  : permission === "denied"
                    ? "destructive"
                    : "secondary"
              }
            >
              {permission}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service Worker</span>
            <span className="text-right text-xs text-muted-foreground">{swStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subskrypcja</span>
            <Badge variant={subData?.isSubscribed ? "default" : "secondary"}>
              {subData?.isSubscribed ? "aktywna" : "brak"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Banner</span>
            <Badge variant={bannerDismissed ? "secondary" : "default"}>
              {bannerDismissed ? "ukryty" : "widoczny"}
            </Badge>
          </div>
          {subData?.endpoint && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Endpoint</span>
              <span className="font-mono text-[10px] break-all text-muted-foreground">
                {subData.endpoint.slice(0, 60)}…
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCwIcon className="mr-1.5 size-3.5" />
            Odśwież status
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!subData?.isSubscribed || testPushMutation.isPending}
            onClick={() => testPushMutation.mutate()}
          >
            <SendIcon className="mr-1.5 size-3.5" />
            Wyślij testowe
          </Button>
          {bannerDismissed && (
            <Button size="sm" variant="outline" onClick={handleResetBanner}>
              <BellOffIcon className="mr-1.5 size-3.5" />
              Reset banner
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
