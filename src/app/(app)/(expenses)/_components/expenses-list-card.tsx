'use client';

import { type Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { CircleDollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Skeleton } from '@/app/_components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  id: string;
  status: ReturnType<typeof getExpenseStatus>;
  name: string;
  amount: number;
  date: Date;
}

export function ExpensesListCard({ id, status, name, amount, date }: ExpensesListCardProps) {
  const router = useRouter();

  const formattedDate = format(date, 'EEEEEE, d MMMM');

  function handleClick() {
    router.push(`/wydatki/${id}`);
  }

  return (
    <button onClick={handleClick} className="w-full py-4">
      <div className="flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-4">
          <ExpensesListCardIcon status={status} />
          <div className="overflow-hidden text-start">
            <div className="line-clamp-1">{name}</div>
            <div className="line-clamp-1 text-sm text-muted-foreground">{formattedDate}</div>
          </div>
        </div>
        <div className="whitespace-nowrap text-sm text-muted-foreground">{amount.toFixed(2)} zł</div>
      </div>
    </button>
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
