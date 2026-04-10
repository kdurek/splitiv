"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@repo/ui/lib/utils";

const DrawerRoot = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;
const DrawerTitle = DrawerPrimitive.Title;
const DrawerDescription = DrawerPrimitive.Description;
const DrawerContent = DrawerPrimitive.Content;

function DrawerBackdrop({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-backdrop"
      className={cn(
        "fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.4] [--bleed:3rem] data-[ending-style]:opacity-0 data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-[starting-style]:opacity-0 data-[swiping]:duration-0 supports-[-webkit-touch-callout:none]:absolute dark:[--backdrop-opacity:0.7]",
        className,
      )}
      {...props}
    />
  );
}

function DrawerViewport({ className, ...props }: DrawerPrimitive.Viewport.Props) {
  return (
    <DrawerPrimitive.Viewport
      data-slot="drawer-viewport"
      className={cn("fixed inset-0 z-50 flex items-end justify-center", className)}
      {...props}
    />
  );
}

function DrawerPopup({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Popup
      data-slot="drawer-popup"
      className={cn(
        "-mb-[3rem] max-h-[calc(80vh+3rem)] w-full [transform:translateY(var(--drawer-swipe-movement-y))] touch-auto overflow-y-auto overscroll-contain rounded-t-2xl bg-background px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+3rem)] outline-1 outline-border transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:[transform:translateY(calc(100%-3rem+2px))] data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-[starting-style]:[transform:translateY(calc(100%-3rem+2px))] data-[swiping]:select-none",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted-foreground/30" />
      {children}
    </DrawerPrimitive.Popup>
  );
}

export {
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerViewport,
  DrawerBackdrop,
  DrawerPopup,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
};
