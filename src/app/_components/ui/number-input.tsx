// https://github.com/mantinedev/mantine/blob/33f51e1a7e755ef189d3e87ce17bd9d78a8a0742/src/mantine-core/src/NumberInput/NumberInput.tsx

'use client';

import { clamp } from '@mantine/hooks';
import * as React from 'react';

import { Input, type InputProps } from '@/app/_components/ui/input';

export interface NumberInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  /** Called when value changes */
  onChange?(value: number | ''): void;

  /** Input value for controlled component */
  value?: number | '';

  /** Default value for uncontrolled component */
  defaultValue?: number | '';

  /** Maximum possible value */
  max?: number;

  /** Minimal possible value */
  min?: number;
}

const precision = 2;
const noClampOnBlur = false;
const decimalSeparator = ',';
const removeTrailingZeros = false;

const formatter = (value: string | ''): string => value || '';
const parser = (value: string | ''): string => {
  if (value === '-') {
    return value;
  }

  let tempNum = value;

  if (tempNum[0] === '.') {
    tempNum = `0${value}`;
  }

  const parsedNum = parseFloat(tempNum);

  if (Number.isNaN(parsedNum)) {
    return '';
  }

  return value;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, defaultValue, min, max, onChange, onFocus, onBlur, onClick, ...props }, ref) => {
    const parsePrecision = (val: number | '') => {
      if (val === '') return '';

      let result = val.toFixed(precision);

      if (removeTrailingZeros && precision > 0) {
        result = result.replace(new RegExp(`[0]{0,${precision}}$`), '');
        if (result.endsWith('.')) {
          result = result.slice(0, -1);
        }
      }

      return result;
    };

    const formatNum = (val: string) => {
      let parsedStr = val;
      if (decimalSeparator) {
        parsedStr = parsedStr.replace('.', decimalSeparator);
      }

      return formatter(parsedStr);
    };

    const parseNum = (val: string): string | '' => {
      let num = val;

      if (decimalSeparator) {
        num = num.replace(decimalSeparator, '.');
      }

      return parser(num);
    };

    const formatInternalValue = (val: number | '') => formatNum(parsePrecision(val));

    // Parsed value that will be used for uncontrolled state and for setting the inputValue
    const [internalValue, _setInternalValue] = React.useState<number | ''>(
      typeof value === 'number' ? value : typeof defaultValue === 'number' ? defaultValue : '',
    );

    // Value of input field. Gets changed through user input and on internalValue change
    const [inputValue, setInputValue] = React.useState(() => formatInternalValue(internalValue));

    const [isFocussed, setIsFocussed] = React.useState(false);

    const setInternalValue = (val: number | '', forceInputValueUpdate?: boolean) => {
      if (!isFocussed || forceInputValueUpdate) {
        const newInputValue = formatInternalValue(val);
        if (newInputValue !== inputValue) {
          // Make sure to update/reset the input value even if the internal value stays the same
          // E. g. this may happen if the internalValue is "10" and the user entered "10abc"
          setInputValue(newInputValue);
        }
      }

      if (val !== internalValue) {
        _setInternalValue(val);
      }
    };

    const _min = typeof min === 'number' ? min : -Infinity;
    const _max = typeof max === 'number' ? max : Infinity;

    React.useEffect(() => {
      if (isFocussed) {
        return;
      }

      if (value === undefined) {
        // For uncontrolled inputs reapply internalValue
        setInternalValue(internalValue, true);
      } else {
        // For controlled inputs apply value
        setInternalValue(value, true);
      }
    }, [value, isFocussed]);

    /**
     * Parse new input value and propagate it via `onChange` to parent.
     */
    const processInputValue = (newInputValue: string) => {
      let normalizedInputValue = newInputValue;
      if (normalizedInputValue[0] === `${decimalSeparator}` || normalizedInputValue[0] === '.') {
        normalizedInputValue = `0${normalizedInputValue}`;
      }

      const parsedValue = parseFloat(parsePrecision(parseFloat(parseNum(normalizedInputValue))));
      const clampedValue = !noClampOnBlur ? clamp(parsedValue, _min, _max) : parsedValue;
      const finalValue = Number.isNaN(clampedValue) ? '' : clampedValue;

      const internalValueChanged = internalValue !== finalValue;

      setInputValue(newInputValue);
      setInternalValue(finalValue);

      if (internalValueChanged) {
        onChange?.(finalValue);
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const evt = event.nativeEvent as InputEvent;
      if (evt.isComposing) {
        return;
      }

      processInputValue(event.target.value);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocussed(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocussed(false);
      onBlur?.(event);
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.currentTarget.select();
      onClick?.(e);
    };

    return (
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        min={min}
        max={max}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        ref={ref}
      />
    );
  },
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };
