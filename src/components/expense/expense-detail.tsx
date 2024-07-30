'use client';

import { format } from 'date-fns';
import Link from 'next/link';

import { DebtRevertButton } from '@/components/debt/debt-revert-button';
import { ExpenseDebtorCard, ExpensePayerCard } from '@/components/expense/expense-debts';
import { ExpenseDeleteModal } from '@/components/expense/expense-delete-modal';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { api, type ExpensesList } from '@/trpc/react';

interface ExpenseDetailProps {
  expense: ExpensesList['items'][number];
}

export function ExpenseDetail({ expense }: ExpenseDetailProps) {
  const [user] = api.user.current.useSuspenseQuery();

  const logs = expense.debts.flatMap((debt) => debt.logs);
  const formattedDate = format(expense.createdAt, 'EEEEEEE, d MMMM yyyy');
  const isPayer = user?.id === expense.payerId;
  const isAdmin = user?.id === expense.group.adminId;

  return (
    <div className="divide-y">
      <div className="pb-4">
        <Heading variant="h1">{expense.name}</Heading>
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
        {expense.description && (
          <div className="mt-4 whitespace-pre-wrap text-muted-foreground">{expense.description}</div>
        )}
      </div>

      <div className="py-4">
        <ExpensePayerCard name={expense.payer.name} amount={Number(expense.amount)} />
      </div>

      <div className="flex flex-col gap-4 py-4">
        {expense.debts.map((debt) => (
          <ExpenseDebtorCard
            key={debt.id}
            debtId={debt.id}
            name={debt.debtor.name}
            amount={Number(debt.amount)}
            settled={Number(debt.settled)}
            canSettle={debt.amount !== debt.settled && (isAdmin || isPayer || (user?.id === debt.debtorId && !isPayer))}
          />
        ))}
      </div>

      {logs.length !== 0 && (
        <div
          className={cn('flex flex-col gap-4 pt-4', {
            'pb-4': isPayer || isAdmin,
          })}
        >
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between gap-4">
              <div className="text-start text-sm text-muted-foreground">
                <div>{log.debt.debtor.name}</div>
                <div>{format(log.createdAt, 'HH:mm dd.MM.yyyy')}</div>
              </div>
              <div className="flex items-center gap-4">
                <div>{Number(log.amount).toFixed(2)} zł</div>
                <DebtRevertButton logId={log.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(isPayer || isAdmin) && (
        <div className="flex gap-2 pt-4">
          <Link href={`/wydatki/${expense.id}/edytuj`} className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
            Edytuj
          </Link>
          <ExpenseDeleteModal expenseId={expense.id} />
        </div>
      )}
    </div>
  );
}
