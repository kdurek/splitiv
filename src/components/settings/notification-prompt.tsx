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

export function NotificationPrompt() {
  const { mutate: createPushSubscription } = api.pushSubscription.create.useMutation();
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.serwist !== undefined) {
      // run only in browser
      void navigator.serviceWorker.ready.then((reg) => {
        void reg.pushManager.getSubscription().then((sub) => {
          if (!sub || (sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
            setIsSubscribed(false);
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
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY),
    });
    createPushSubscription({
      pushSubscription,
    });
    setIsSubscribed(true);
    console.info('Web push subscribed!');
  };

  if (isSubscribed) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-md bg-white p-4">
      <p className="text-center">Wygląda na to, że nie masz włączonych powiadomień</p>
      <Button type="button" onClick={subscribeButtonOnClick} disabled={isSubscribed}>
        Włącz powiadomienia
      </Button>
    </div>
  );
}
