'use client';

import { format } from 'date-fns';
import type Decimal from 'decimal.js';
import type { ReactNode } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface ExpenseListItemProps {
  name: string;
  isPayer: boolean;
  createdAt: Date;
  fullAmount: Decimal;
  toPayAmount: Decimal;
  children: ReactNode;
}

export function ExpenseListItem({ name, isPayer, createdAt, fullAmount, toPayAmount, children }: ExpenseListItemProps) {
  return (
    // TODO: Remove when fixed: https://github.com/emilkowalski/vaul/issues/455
    <Drawer disablePreventScroll={false}>
      <DrawerTrigger asChild>
        <button className="w-full outline-none">
          <div className="flex items-start justify-between overflow-hidden py-4">
            <div className="overflow-hidden text-start">
              <div className="line-clamp-1">{name}</div>
              <div className="line-clamp-1 text-sm text-muted-foreground">{format(createdAt, 'EEEEEE, d MMMM')}</div>
            </div>
            <div className="overflow-hidden text-end">
              <div className={cn('whitespace-nowrap', isPayer ? 'text-green-500' : 'text-red-500')}>
                {Number(toPayAmount).toFixed(2)} zł
              </div>
              <div className={cn('whitespace-nowrap text-sm text-muted-foreground')}>
                {Number(fullAmount).toFixed(2)} zł
              </div>
            </div>
          </div>
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[96%] overflow-auto overscroll-none p-4">{children}</DrawerContent>
    </Drawer>
  );
}
