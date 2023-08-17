"use client";

import * as React from "react";

import { Input } from "./input";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const formatCurrency = (v: string): string => {
  const parsedValue = parseFloat(v.replace(/[^\d.-]/g, ""));

  if (!Number.isNaN(parsedValue)) {
    return parsedValue.toFixed(2);
  }

  return parseFloat("0").toFixed(2);
};

const CurrencyInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, onBlur, onClick, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const precision = 2;
      const { value, min, max } = e.target;

      if (onChange && typeof value === "string") {
        if (max && parseFloat(value) > Number(max)) {
          onChange({
            ...e,
            target: { ...e.target, value: Number(max).toFixed(precision) },
          });
        } else if (min && parseFloat(value) < Number(min)) {
          onChange({
            ...e,
            target: { ...e.target, value: Number(min).toFixed(precision) },
          });
        } else {
          onChange({
            ...e,
            target: { ...e.target, value: formatCurrency(value) },
          });
        }
      }

      if (onBlur) {
        onBlur(e);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.currentTarget.select();

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Input
        type="number"
        inputMode="decimal"
        min={0}
        step={0.01}
        onBlur={handleBlur}
        onChange={handleChange}
        onClick={handleClick}
        ref={ref}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
