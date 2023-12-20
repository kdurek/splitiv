'use client';

import { Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { CircleDollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

type ExpenseWithDebts = Prisma.ExpenseGetPayload<{
  include: {
    debts: true;
  };
}>;

const getSettledStateIcon = (expense: ExpenseWithDebts) => {
  const isPartiallySettled = expense.debts
    .filter((debt) => debt.debtorId !== expense.payerId)
    .some((debt) => (debt.settled !== debt.amount && Number(debt.settled) !== 0) || debt.settled === debt.amount);
  const isFullySettled = expense.debts.every((debt) => debt.settled === debt.amount);

  return (
    <div
      className={cn('grid h-10 w-10 place-content-center rounded-md', {
        'bg-blue-100': !isPartiallySettled && !isFullySettled,
        'bg-yellow-100': isPartiallySettled,
        'bg-teal-100': isFullySettled,
      })}
    >
      <CircleDollarSign
        className={cn({
          'text-blue-500': !isPartiallySettled && !isFullySettled,
          'text-yellow-500': isPartiallySettled,
          'text-teal-500': isFullySettled,
        })}
      />
    </div>
  );
};

interface ExpenseCardProps {
  expense: ExpenseWithDebts;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const router = useRouter();

  const formattedDate = format(expense.createdAt, 'EEEEEE, d MMMM');

  function handleClick() {
    router.push(`/wydatki/${expense.id}`);
  }

  return (
    <button onClick={handleClick} className="w-full py-4">
      <div className="flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-4">
          <div>{getSettledStateIcon(expense)}</div>
          <div className="overflow-hidden text-start">
            <div className="line-clamp-1">{expense.name}</div>
            <div className="line-clamp-1 text-sm text-muted-foreground">{formattedDate}</div>
          </div>
        </div>
        <div className="whitespace-nowrap text-sm text-muted-foreground">{Number(expense.amount).toFixed(2)} zł</div>
      </div>
    </button>
  );
}
