import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { inputVariants } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import * as React from "react";

function NumberField(props: React.ComponentProps<typeof NumberFieldPrimitive.Root>) {
  return <NumberFieldPrimitive.Root data-slot="number-field" {...props} locale="pl" />;
}

function NumberFieldGroup({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Group>) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        "flex h-9 w-full min-w-0 items-center rounded-4xl border border-input bg-input/30 transition-colors has-[[data-slot=number-field-input]:focus-visible]:border-ring has-[[data-slot=number-field-input]:focus-visible]:ring-[3px] has-[[data-slot=number-field-input]:focus-visible]:ring-ring/50 *:data-[slot=number-field-input]:flex-1 *:data-[slot=number-field-input]:rounded-none *:data-[slot=number-field-input]:border-0 *:data-[slot=number-field-input]:bg-transparent *:data-[slot=number-field-input]:shadow-none *:data-[slot=number-field-input]:focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldInput({
  className,
  onFocus,
  onInput,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Input>) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(inputVariants, className)}
      onFocus={(event) => {
        event.currentTarget.select();
        onFocus?.(event);
      }}
      onInput={(event) => {
        // Skip our own re-dispatched event (isTrusted is false for programmatic events).
        if (!event.nativeEvent.isTrusted) return;
        const input = event.currentTarget;
        if (input.value.includes(".")) {
          const cursor = input.selectionStart;
          input.value = input.value.replaceAll(".", ",");
          if (cursor !== null) input.setSelectionRange(cursor, cursor);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        onInput?.(event);
      }}
      onContextMenu={(e) => e.preventDefault()}
      {...props}
    />
  );
}

function NumberFieldIncrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Increment>) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      className={cn(
        "flex items-center justify-center px-2.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldDecrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Decrement>) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      className={cn(
        "flex items-center justify-center px-2.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldScrubArea({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.ScrubArea>) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    />
  );
}

function NumberFieldScrubAreaCursor({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.ScrubAreaCursor>) {
  return (
    <NumberFieldPrimitive.ScrubAreaCursor
      data-slot="number-field-scrub-area-cursor"
      className={cn(className)}
      {...props}
    />
  );
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
};
