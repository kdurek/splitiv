import { format } from 'date-fns';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ExpenseDebtorCard, ExpensePayerCard } from '@/components/expense/expense-debts';
import { ExpenseDeleteModal } from '@/components/expense/expense-delete-modal';
import { ExpenseDescriptionCard } from '@/components/expense/expense-description-card';
import { ExpenseNoteCard } from '@/components/expense/expense-note-card';
import { ExpenseNoteForm } from '@/components/expense/expense-note-form';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

interface ExpensePageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const expense = await api.expense.byId.query({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  const formattedDate = format(expense.createdAt, 'EEEEEEE, d MMMM yyyy');
  const isPayer = session.user.id === expense.payerId;
  const isAdmin = session.user.id === expense.group.adminId;

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
            canSettle={
              debt.amount !== debt.settled && (isAdmin || isPayer || (session.user.id === debt.debtorId && !isPayer))
            }
          />
        ))}
      </div>

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
            <Link href={`/wydatki/${expense.id}/edytuj`} className={cn(buttonVariants({ variant: 'outline' }))}>
              Edytuj
            </Link>
            <ExpenseDeleteModal expenseId={expense.id} />
          </div>
        </div>
      )}
    </div>
  );
}
