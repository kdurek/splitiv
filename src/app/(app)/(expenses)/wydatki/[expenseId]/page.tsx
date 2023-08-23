import { DeleteExpenseModal } from 'components/delete-expense-modal';
import { ExpensePayment } from 'components/expense-payment';
import { buttonVariants } from 'components/ui/button';
import { format } from 'date-fns';
import { cn } from 'lib/utils';
import { CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createTrpcCaller } from 'server/api/caller';
import { getServerAuthSession } from 'server/auth';

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

  const caller = await createTrpcCaller();
  const expense = await caller.expense.getById({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  const descriptionParts = expense.description?.split('\n');
  const hasDescription = descriptionParts?.length;
  const formattedDate = format(expense.createdAt, 'EEEEEE, d MMMM');
  const isPayer = session.user.id === expense.payerId;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl">{expense.name}</h1>
        {hasDescription && (
          <div className="text-sm text-muted-foreground">
            {descriptionParts?.map((part, index) => <div key={index}>{part}</div>)}
          </div>
        )}
        <div>{formattedDate}</div>
      </div>

      <div className="space-y-2">
        <div className="w-full rounded-md border p-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="grid h-10 w-10 shrink-0 place-content-center rounded-md bg-slate-100">
                <CircleDollarSign className="text-slate-500" />
              </div>
              <div className="overflow-hidden text-start">
                <div className="line-clamp-1 text-xs font-medium uppercase text-muted-foreground">Zapłacone</div>
                <div className="line-clamp-1">{expense.payer.name}</div>
              </div>
            </div>
            <div className="text-end">
              <div className="line-clamp-1 text-xs font-medium uppercase text-muted-foreground">Kwota</div>
              <div className="whitespace-nowrap">{Number(expense.amount).toFixed(2)} zł</div>
            </div>
          </div>
        </div>
        {expense.debts.map((debt) => (
          <ExpensePayment key={debt.id} payerId={expense.payerId} debt={debt} />
        ))}
      </div>

      {isPayer && (
        <div className="flex items-center justify-end gap-4">
          <Link href={`/wydatki/${expense.id}/edytuj`} className={cn(buttonVariants({ variant: 'outline' }))}>
            Edytuj
          </Link>
          <DeleteExpenseModal expenseId={expense.id} />
        </div>
      )}
    </div>
  );
}
