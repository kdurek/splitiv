'use client';

import { type Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { CircleDollarSign } from 'lucide-react';
import type { Session } from 'next-auth';

import { Drawer, DrawerContent, DrawerTrigger } from '@/app/_components/ui/drawer';
import { Skeleton } from '@/app/_components/ui/skeleton';
import { ExpenseDetail } from '@/app/(app)/(expenses)/_components/expense-detail';
import { cn } from '@/lib/utils';
import type { ExpensesGetArchived, ExpensesGetDashboard } from '@/trpc/shared';

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

interface ExpensesListCardIconProps {
  status: ReturnType<typeof getExpenseStatus>;
}

function ExpensesListCardIcon({ status }: ExpensesListCardIconProps) {
  return (
    <div
      className={cn('grid h-10 w-10 place-content-center rounded-md', {
        'bg-blue-100': status === 'unsettled',
        'bg-yellow-100': status === 'partially-settled',
        'bg-teal-100': status === 'fully-settled',
      })}
    >
      <CircleDollarSign
        className={cn({
          'text-blue-500': status === 'unsettled',
          'text-yellow-500': status === 'partially-settled',
          'text-teal-500': status === 'fully-settled',
        })}
      />
    </div>
  );
}

interface ExpensesListCardProps {
  expense: ExpensesGetDashboard['items'][number] | ExpensesGetArchived['items'][number];
  session: Session;
}

export function ExpensesListCard({ expense, session }: ExpensesListCardProps) {
  const formattedDate = format(expense.createdAt, 'EEEEEE, d MMMM');

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="w-full py-4 outline-none">
          <div className="flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-4">
              <ExpensesListCardIcon status={getExpenseStatus(expense)} />
              <div className="overflow-hidden text-start">
                <div className="line-clamp-1">{expense.name}</div>
                <div className="line-clamp-1 text-sm text-muted-foreground">{formattedDate}</div>
              </div>
            </div>
            <div className="whitespace-nowrap text-sm text-muted-foreground">
              {Number(expense.amount).toFixed(2)} zł
            </div>
          </div>
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[96%]">
        <div className="overflow-auto p-4">
          <ExpenseDetail expense={expense} session={session} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function ExpensesListCardSkeleton() {
  return (
    <div className="w-full py-4">
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
