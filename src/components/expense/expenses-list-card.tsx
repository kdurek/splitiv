'use client';

import { type Prisma } from '@prisma/client';
import { format } from 'date-fns';
import type { User } from 'lucia';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ExpensesListActive, ExpensesListArchive } from '@/trpc/shared';

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
  const formattedDate = format(expense.createdAt, 'EEEEEE, d MMMM');

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="w-full bg-white p-4 outline-none">
          <div className="flex items-start justify-between overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="overflow-hidden text-start">
                <div className="line-clamp-1">{expense.name}</div>
                <div className="line-clamp-1 text-sm text-muted-foreground">{formattedDate}</div>
              </div>
            </div>
            <div
              className={cn(
                'whitespace-nowrap text-sm',
                expense.payerId === user.id ? 'text-green-500' : 'text-red-500',
              )}
            >
              {Number(expense.amount).toFixed(2)} zł
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

export function ExpensesListCardSkeleton() {
  return (
    <div className="w-full bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
        <Skeleton className="h-4 w-[50px]" />
      </div>
    </div>
  );
}
