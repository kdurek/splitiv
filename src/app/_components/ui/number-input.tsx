'use client';

import InputNumber, { type InputNumberProps } from 'rc-input-number';
import * as React from 'react';

const NumberInput = React.forwardRef<HTMLInputElement, InputNumberProps>(({ onClick, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
    onClick?.(e);
  };

  return <InputNumber ref={ref} precision={2} decimalSeparator="," onClick={handleClick} {...props} />;
});
NumberInput.displayName = 'NumberInput';

export { NumberInput };
