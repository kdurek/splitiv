'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'components/ui/button';
import { Checkbox } from 'components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from 'components/ui/form';
import Decimal from 'decimal.js';
import { useSettleExpenseDebts } from 'hooks/use-settle-expense-debts';
import { ArrowUp, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { GetPaymentSettle, GetUserById } from 'utils/api';
import { z } from 'zod';

const expensePayListSchema = z.object({ debts: z.array(z.string()) }).refine((values) => values.debts.length !== 0, {
  message: 'Musisz wybrać przynajmniej jeden dług',
  path: ['debts'],
});

type ExpensePayListSchema = z.infer<typeof expensePayListSchema>;

interface ExpensePaymentSettleFormProps {
  paramUser: GetUserById;
  currentUser: GetUserById;
  debts: GetPaymentSettle;
}

export function ExpensePaymentSettleForm({ paramUser, currentUser, debts }: ExpensePaymentSettleFormProps) {
  const router = useRouter();

  const form = useForm<ExpensePayListSchema>({
    defaultValues: {
      debts: [],
    },
    resolver: zodResolver(expensePayListSchema),
  });

  const { mutate: settleExpenseDebts, isLoading: isLoadingSettleExpenseDebts } = useSettleExpenseDebts();

  const filteredDebts = debts.filter((debt) => form.watch('debts').includes(debt.id));

  const paramUserDebts = filteredDebts.filter((debt) => debt.debtorId === paramUser?.id);
  const currentUserDebts = filteredDebts.filter((debt) => debt.debtorId === currentUser?.id);

  const paramUserTotalAmount = paramUserDebts.reduce(
    (acc, cur) => Decimal.add(acc, Decimal.sub(cur.amount, cur.settled)),
    new Decimal(0),
  );
  const currentUserTotalAmount = currentUserDebts.reduce(
    (acc, cur) => Decimal.add(acc, Decimal.sub(cur.amount, cur.settled)),
    new Decimal(0),
  );

  const totalDiff = currentUserTotalAmount.greaterThan(paramUserTotalAmount)
    ? Decimal.sub(currentUserTotalAmount, paramUserTotalAmount).toFixed(2)
    : Decimal.sub(paramUserTotalAmount, currentUserTotalAmount).toFixed(2);

  const payer = currentUserTotalAmount.greaterThan(paramUserTotalAmount) ? paramUser : currentUser;
  const debtor = currentUserTotalAmount.greaterThan(paramUserTotalAmount) ? currentUser : paramUser;

  const handleSettleExpenseDebts = (values: ExpensePayListSchema) => {
    const expenseDebts = debts
      .filter((debt) => values.debts.includes(debt.id))
      .map((debt) => {
        const amountToSettle = Number(debt.amount);
        return {
          id: debt.id,
          settled: amountToSettle,
        };
      });

    settleExpenseDebts(
      {
        expenseDebts,
      },
      {
        onSuccess() {
          const hasExpenseDebtsLeft = debts.some((debt) => !values.debts.includes(debt.id));
          if (!hasExpenseDebtsLeft) {
            router.push('/');
          }
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSettleExpenseDebts)}>
        <FormField
          control={form.control}
          name="debts"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Wydatki</FormLabel>
                <FormDescription>Zaznacz te które chcesz rozliczyć</FormDescription>
              </div>
              {debts.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="debts"
                  render={({ field }) => {
                    return (
                      <FormItem className="space-y-2 rounded-md border p-4">
                        <div className="flex items-center justify-between gap-4">
                          <FormLabel className="font-normal">
                            <div className="line-clamp-1">{item.expense.name}</div>
                          </FormLabel>
                          <FormControl>
                            <Checkbox
                              className="h-6 w-6"
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(field.value?.filter((value) => value !== item.id));
                              }}
                            />
                          </FormControl>
                        </div>
                        <div className="grid grid-cols-5 place-items-center">
                          <div className="text-sm text-muted-foreground">{item.debtor.name}</div>
                          <ChevronRight />
                          <div className="text-sm text-muted-foreground">
                            {(Number(item.amount) - Number(item.settled)).toFixed(2)} zł
                          </div>
                          <ChevronRight />
                          <div className="text-sm text-muted-foreground">{item.expense.payer.name}</div>
                        </div>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />
        <div className="mt-6">
          <div className="mb-4">
            <FormLabel className="text-base">Wydatki</FormLabel>
            <FormDescription>Zaznacz te które chcesz rozliczyć</FormDescription>
          </div>
          <div className="grid grid-cols-5 place-items-center rounded-md border p-4">
            <div className="text-sm text-muted-foreground">{debtor?.name}</div>
            <ChevronRight />
            <div className="text-sm text-muted-foreground">{totalDiff} zł</div>
            <ChevronRight />
            <div className="text-sm text-muted-foreground">{payer?.name}</div>
          </div>
          <div className="sticky bottom-16 mt-6 flex items-center justify-end gap-4">
            <Button
              type="button"
              size="icon"
              onClick={() =>
                form.setValue(
                  'debts',
                  debts.flatMap((debt) => debt.id),
                )
              }
            >
              <ArrowUp />
            </Button>
            <Button>
              {isLoadingSettleExpenseDebts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rozlicz
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
