import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'components/ui/button';
import { Collapsible, CollapsibleContent } from 'components/ui/collapsible';
import { Form, FormControl, FormField, FormItem } from 'components/ui/form';
import { NumberInput } from 'components/ui/number-input';
import { Separator } from 'components/ui/separator';
import { useDisclosure } from 'hooks/use-disclosure';
import { useUpdateExpenseDebt } from 'hooks/use-update-expense-debt';
import { cn } from 'lib/utils';
import { Loader2, Square, XSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import type { GetInfiniteExpenses } from 'utils/api';
import z from 'zod';

interface ExpenseCardPaymentProps {
  debt: GetInfiniteExpenses['items'][number]['debts'][number];
}

const expenseCardPaymentFormSchema = z.object({
  amount: z.number({ required_error: 'Musisz wpisać kwotę' }).positive({ message: 'Kwota musi być większa niż zero' }),
});

type ExpenseCardPaymentFormSchema = z.infer<typeof expenseCardPaymentFormSchema>;

export function ExpensePayment({ debt }: ExpenseCardPaymentProps) {
  const { data: session } = useSession();

  const { mutate: updateExpenseDebt, isLoading: isLoadingUpdateExpenseDebt } = useUpdateExpenseDebt();

  const [isEditing, { toggle: toggleIsEditing, close: closeIsEditing }] = useDisclosure(false);

  const [isPartialPay, { toggle: toggleIsPartialPay, close: closeIsPartialPay }] = useDisclosure(false);

  const form = useForm<ExpenseCardPaymentFormSchema>({
    defaultValues: {
      amount: 0,
    },
    resolver: zodResolver(expenseCardPaymentFormSchema),
  });

  const [debtorFirstName] = debt.debtor.name?.split(' ') ?? '';

  const notHavePermission = session?.user?.id !== debt.debtorId && session?.user?.id !== debt.expense.payerId;

  const watchAmount = form.watch('amount');

  const isFullySettled = debt.settled === debt.amount;

  const isPartiallySettled = debt.settled !== debt.amount && Number(debt.settled) !== 0;

  const maximumAmount = Number(debt.amount) - Number(debt.settled);

  const statusIcon = isFullySettled ? <XSquare /> : <Square />;

  const handlePayPartially = (values: ExpenseCardPaymentFormSchema) => {
    updateExpenseDebt(
      {
        expenseDebtId: debt.id,
        settled: Number(values.amount) + Number(debt.settled),
      },
      {
        onSuccess() {
          closeIsEditing();
          closeIsPartialPay();
          form.reset();
        },
        onError(error) {
          form.setError('amount', error);
        },
      },
    );
  };

  const handlePayFully = () => {
    updateExpenseDebt(
      {
        expenseDebtId: debt.id,
        settled: Number(debt.amount),
      },
      {
        onSuccess() {
          closeIsEditing();
          form.reset();
        },
        onError(error) {
          form.setError('amount', error);
        },
      },
    );
  };

  return (
    <div className="rounded-md border p-2">
      <Collapsible open={isEditing}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn('text-blue-500 hover:text-blue-500', {
              'text-red-500 hover:text-red-500': isEditing,
              'text-teal-500 hover:text-teal-500': !isEditing && isFullySettled,
              'text-yellow-500 hover:text-yellow-500': !isEditing && isPartiallySettled,
            })}
            onClick={() => !isFullySettled && !notHavePermission && toggleIsEditing()}
          >
            {isEditing ? <XSquare /> : statusIcon}
          </Button>
          <div>
            {isFullySettled
              ? `${debtorFirstName} - ${Number(debt.amount).toFixed(2)} zł oddane`
              : `${debtorFirstName} - ${maximumAmount.toFixed(2)} zł do oddania`}
          </div>
        </div>
        <CollapsibleContent>
          <Separator className="mt-2" />
          <div className="pt-4 text-center">Jaką kwotę chcesz oddać?</div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Button type="button" variant="secondary" onClick={toggleIsPartialPay}>
              Część
            </Button>
            <Button type="button" disabled={isPartialPay} onClick={handlePayFully}>
              Całość
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible open={isPartialPay}>
        <CollapsibleContent>
          <Separator className="mt-4" />
          <Form {...form}>
            <form className="mx-6 pt-4" onSubmit={form.handleSubmit(handlePayPartially)}>
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <NumberInput max={maximumAmount} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button>
                  {isLoadingUpdateExpenseDebt && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Oddaj
                </Button>
              </div>
              <div className="mt-2 text-center">
                Zostanie do oddania {(maximumAmount - Number(watchAmount)).toFixed(2)} zł
              </div>
              {form.formState.errors.amount && (
                <div className="mt-2 text-center text-xs text-red-500">{form.formState.errors.amount.message}</div>
              )}
            </form>
          </Form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
