'use client';

import { type Prisma } from '@prisma/client';
import { format } from 'date-fns';
import Decimal from 'decimal.js';
import type { User } from 'lucia';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ExpensesListActive, ExpensesListArchive } from '@/trpc/react';

type ExpenseWithDebts = Prisma.ExpenseGetPayload<{
  include: {
    debts: true;
  };
}>;

export function getExpenseStatus(expense: ExpenseWithDebts) {
  const isPartiallySettled = expense.debts
    .filter((debt) => debt.debtorId !== expense.payerId)
    .some((debt) => (debt.settled !== debt.amount && Number(debt.settled) !== 0) || debt.settled === debt.amount);
  const isFullySettled = expense.debts.every((debt) => debt.settled === debt.amount);

  if (isFullySettled) return 'fully-settled';
  if (isPartiallySettled) return 'partially-settled';
  return 'unsettled';
}

interface ExpensesListCardProps {
  expense: ExpensesListActive['items'][number] | ExpensesListArchive['items'][number];
  user: User;
}

export function ExpensesListCard({ expense, user }: ExpensesListCardProps) {
  const isPayer = expense.payerId === user.id;
  const userDebt = expense.debts.find((debt) => debt.debtorId === user.id);

  const debtorsWithoutPayerLeft = expense.debts.reduce((acc, debt) => {
    if (debt.debtorId !== expense.payerId && debt.settled !== debt.amount) {
      return Decimal.add(acc, Decimal.sub(debt.amount, debt.settled));
    }
    return acc;
  }, new Decimal(0));

  const payerDisplayAmount = debtorsWithoutPayerLeft.isZero()
    ? userDebt
      ? Decimal.sub(expense.amount, userDebt.amount)
      : Decimal.sub(expense.amount, debtorsWithoutPayerLeft)
    : debtorsWithoutPayerLeft;
  const debtorDisplayAmount = userDebt
    ? userDebt.amount === userDebt.settled
      ? userDebt.amount
      : Decimal.sub(userDebt.amount, userDebt.settled)
    : new Decimal(0);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="w-full bg-white p-4 outline-none">
          <div className="flex items-start justify-between overflow-hidden">
            <div className="overflow-hidden text-start">
              <div className="line-clamp-1">{expense.name}</div>
              <div className="line-clamp-1 text-sm text-muted-foreground">
                {format(expense.createdAt, 'EEEEEE, d MMMM')}
              </div>
            </div>
            <div className="overflow-hidden text-end">
              <div className={cn('whitespace-nowrap', isPayer ? 'text-green-500' : 'text-red-500')}>
                {Number(isPayer ? payerDisplayAmount : debtorDisplayAmount).toFixed(2)} zł
              </div>
              <div className={cn('whitespace-nowrap text-sm text-muted-foreground')}>
                {Number(expense.amount).toFixed(2)} zł
              </div>
            </div>
          </div>
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[96%]">
        <div className="overflow-auto overscroll-none p-4">
          <ExpenseDetail expense={expense} user={user} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
