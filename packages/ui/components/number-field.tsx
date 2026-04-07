import { inputVariants } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import type * as React from "react";
import {
  Input as InputPrimitive,
  NumberField as NumberFieldPrimitive,
} from "react-aria-components";

function NumberField({ className, ...props }: React.ComponentProps<typeof NumberFieldPrimitive>) {
  return <NumberFieldPrimitive data-slot="number-field" {...props} />;
}

function NumberFieldInput({
  className,
  onFocus,
  ...props
}: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      className={cn(inputVariants, className)}
      data-slot="number-field-input"
      onFocus={(event) => {
        event.currentTarget.select();
        onFocus?.(event);
      }}
      {...props}
    />
  );
}

export { NumberField, NumberFieldInput };
