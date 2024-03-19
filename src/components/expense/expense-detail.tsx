'use client';

import { format } from 'date-fns';
import type { User } from 'lucia';
import Link from 'next/link';

import { DebtRevertButton } from '@/components/debt/debt-revert-button';
import { ExpenseDebtorCard, ExpensePayerCard } from '@/components/expense/expense-debts';
import { ExpenseDeleteModal } from '@/components/expense/expense-delete-modal';
import { ExpenseDescriptionCard } from '@/components/expense/expense-description-card';
import { ExpenseNoteCard } from '@/components/expense/expense-note-card';
import { ExpenseNoteForm } from '@/components/expense/expense-note-form';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import type { ExpensesListActive, ExpensesListArchive } from '@/trpc/shared';

interface ExpenseDetailProps {
  expense: ExpensesListActive['items'][number] | ExpensesListArchive['items'][number];
  user: User;
}

export function ExpenseDetail({ expense, user }: ExpenseDetailProps) {
  const logs = expense.debts.flatMap((debt) => debt.logs);
  const formattedDate = format(expense.createdAt, 'EEEEEEE, d MMMM yyyy');
  const isPayer = user.id === expense.payerId;
  const isAdmin = user.id === expense.group.adminId;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading variant="h1">{expense.name}</Heading>
        <ExpenseDescriptionCard description={expense.description} />
        <div>{formattedDate}</div>
      </div>

      <div className="divide-y">
        <ExpensePayerCard name={expense.payer.name} amount={Number(expense.amount)} />
        {expense.debts.map((debt) => (
          <ExpenseDebtorCard
            key={debt.id}
            debtId={debt.id}
            name={debt.debtor.name}
            amount={Number(debt.amount)}
            settled={Number(debt.settled)}
            canSettle={debt.amount !== debt.settled && (isAdmin || isPayer || (user.id === debt.debtorId && !isPayer))}
          />
        ))}
      </div>

      {logs.length !== 0 && (
        <div className="space-y-2">
          <Heading variant="h2">Historia</Heading>
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="py-4">
                <div className="flex justify-between gap-4">
                  <div className="text-start text-sm text-muted-foreground">
                    <div>{log.debt.debtor.name}</div>
                    <div>{format(log.createdAt, 'HH:mm dd.MM.yyyy')}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>{Number(log.amount).toFixed(2)} zł</div>
                    <DebtRevertButton id={log.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Heading variant="h2">Notatki</Heading>
        <ExpenseNoteForm expenseId={expense.id} />
        <div className="divide-y">
          {expense.notes.length !== 0 ? (
            expense.notes.map((note) => (
              <ExpenseNoteCard
                key={note.id}
                content={note.content}
                createdByName={note.createdBy?.name}
                createdAt={note.createdAt}
              />
            ))
          ) : (
            <div className="py-4">Nie dodano jeszcze żadnej notatki</div>
          )}
        </div>
      </div>

      {(isPayer || isAdmin) && (
        <div className="space-y-2">
          <Heading variant="h2">Ustawienia</Heading>
          <div className="flex gap-2">
            <Link
              href={`/wydatki/${expense.id}/edytuj`}
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
            >
              Edytuj
            </Link>
            <ExpenseDeleteModal expenseId={expense.id} />
          </div>
        </div>
      )}
    </div>
  );
}
