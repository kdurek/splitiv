'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { env } from '@/env';
import { api } from '@/trpc/react';

const base64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function Notification() {
  const { mutate: sendNotification } = api.pushSubscription.sendNotification.useMutation();
  const { mutate: createPushSubscription } = api.pushSubscription.create.useMutation();
  const { mutate: deletePushSubscription } = api.pushSubscription.delete.useMutation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.serwist !== undefined) {
      // run only in browser
      void navigator.serviceWorker.ready.then((reg) => {
        void reg.pushManager.getSubscription().then((sub) => {
          if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick = async () => {
    if (!env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY) {
      throw new Error('Environment variables supplied not sufficient.');
    }
    if (!registration) {
      console.error('No SW registration available.');
      return;
    }
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY),
    });
    createPushSubscription({
      pushSubscription: sub,
    });
    setSubscription(sub);
    setIsSubscribed(true);
    console.log('Web push subscribed!');
  };

  const unsubscribeButtonOnClick = async () => {
    if (!subscription) {
      console.error('Web push not subscribed');
      return;
    }
    await subscription.unsubscribe();
    deletePushSubscription({ endpoint: subscription.endpoint });
    setSubscription(null);
    setIsSubscribed(false);
    console.log('Web push unsubscribed!');
  };

  const sendNotificationButtonOnClick = async () => {
    if (!subscription) {
      alert('Web push not subscribed');
      return;
    }

    sendNotification({
      title: 'Nowy wydatek',
      body: 'Dodano wydatek w którym uczestniczysz',
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={subscribeButtonOnClick} disabled={isSubscribed}>
        Subscribe
      </Button>
      <Button type="button" onClick={unsubscribeButtonOnClick} disabled={!isSubscribed}>
        Unsubscribe
      </Button>
      <Button type="button" onClick={sendNotificationButtonOnClick} disabled={!isSubscribed}>
        Send Notification
      </Button>
    </div>
  );
}
