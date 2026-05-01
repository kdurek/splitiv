export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const register = async () => {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

    const applyUpdate = () => {
      if (registration.waiting && registration.active) {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => window.location.reload(),
          { once: true },
        );
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    };

    const trackWorker = (worker: ServiceWorker) => {
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") applyUpdate();
      });
    };

    applyUpdate();

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
