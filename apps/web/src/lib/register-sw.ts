export function registerServiceWorker(onUpdateFound?: () => void) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const register = async () => {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

    let notified = false;

    const notifyIfWaiting = () => {
      if (notified) return;
      if (registration.waiting && registration.active) {
        notified = true;
        onUpdateFound?.();
      }
    };

    const trackWorker = (worker: ServiceWorker) => {
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") notifyIfWaiting();
      });
    };

    notifyIfWaiting();

    // SW might already be installing when we get here (missed updatefound)
    if (registration.installing) trackWorker(registration.installing);

    registration.addEventListener("updatefound", () => {
      if (registration.installing) trackWorker(registration.installing);
    });

    const checkForUpdate = () => registration.update().catch(() => {});

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdate();
    });

    window.addEventListener("focus", checkForUpdate);
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
