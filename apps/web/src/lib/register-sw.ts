export function registerServiceWorker(onUpdateFound?: () => void) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const register = async () => {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

    let notified = false;
    const notifyIfWaiting = () => {
      if (notified) return;
      if (registration.waiting && navigator.serviceWorker.controller) {
        notified = true;
        onUpdateFound?.();
      }
    };

    notifyIfWaiting();

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed") {
          notifyIfWaiting();
        }
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update();
      }
    });
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
