'use client';

import { format } from 'date-fns';
import type Decimal from 'decimal.js';
import type { ReactNode } from 'react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Prisma } from '@prisma/client';

interface ExpenseListItemProps {
  name: string;
  description: string | null;
  payer: Prisma.ExpenseGetPayload<{
    include: {
      payer: true;
    };
  }>['payer'];
  debts: Prisma.ExpenseGetPayload<{
    include: {
      debts: true;
    };
  }>['debts'];
  isPayer: boolean;
  createdAt: Date;
  fullAmount: Decimal;
  toPayAmount: Decimal;
  children: ReactNode;
}

export function ExpenseListItem({
  name,
  description,
  payer,
  isPayer,
  debts,
  createdAt,
  fullAmount,
  toPayAmount,
  children,
}: ExpenseListItemProps) {
  const isCurrentUserInDebts = Boolean(debts.find((debt) => debt.debtorId === payer.id));
  const numberOfDebtorsWithoutPayer = debts.length - (isCurrentUserInDebts ? 1 : 0);

  return (
    // TODO: Remove when fixed: https://github.com/emilkowalski/vaul/issues/455
    <Drawer disablePreventScroll={false}>
      <DrawerTrigger asChild>
        <Card>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription className="whitespace-pre-wrap">{description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-start">
                <div className="text-sm text-muted-foreground">Zapłacone przez</div>
                <div>{payer.name}</div>
              </div>
              <div className="text-start">
                <div className="text-sm text-muted-foreground">Kwota wydatku</div>
                <div>{Number(fullAmount).toFixed(2)} zł</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-start">
                <div className="text-sm text-muted-foreground">Uczestnicy</div>
                <div>{`${numberOfDebtorsWithoutPayer}${isCurrentUserInDebts ? ' + Ty' : ''}`}</div>
              </div>
              <div className="text-start">
                <div className="text-sm text-muted-foreground">Twój udział</div>
                <div className={cn(isPayer ? 'text-green-500' : 'text-red-500')}>
                  {Number(toPayAmount).toFixed(2)} zł
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground capitalize">
            {format(createdAt, 'EEEE, d MMMM yyyy')}
          </CardFooter>
        </Card>
      </DrawerTrigger>
      <DrawerContent className="max-h-[96%]">
        <div className="overflow-y-auto overscroll-none p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
