'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Heading } from '@/components/ui/heading';
import { Label } from '@/components/ui/label';
import { useSettleExpenseDebts } from '@/hooks/use-settle-expense-debts';
import type { ExpenseDebtList, UserById } from '@/trpc/shared';

const expenseSettlementFormSchema = z.object({
  debts: z.array(
    z.object({
      id: z.string(),
      selected: z.boolean(),
      name: z.string(),
      amount: z.number(),
      settled: z.number(),
      payerId: z.string(),
      payerName: z.string().nullable(),
      debtorId: z.string(),
      debtorName: z.string().nullable(),
    }),
  ),
});

type ExpenseSettlementFormSchema = z.infer<typeof expenseSettlementFormSchema>;

interface ExpenseSettlementFormProps {
  paramUser: UserById;
  currentUser: UserById;
  paramUserDebts: ExpenseDebtList;
  currentUserDebts: ExpenseDebtList;
}

export function ExpenseSettlementForm({
  paramUser,
  currentUser,
  paramUserDebts,
  currentUserDebts,
}: ExpenseSettlementFormProps) {
  const { mutate: settlement, isPending: isPendingSettleExpenseDebts } = useSettleExpenseDebts();

  const form = useForm<ExpenseSettlementFormSchema>({
    values: {
      debts: [...paramUserDebts, ...currentUserDebts].flatMap((debt) => ({
        id: debt.id,
        selected: true,
        name: debt.expense.name,
        amount: Number(debt.amount),
        settled: Number(debt.settled),
        payerId: debt.expense.payer.id,
        payerName: debt.expense.payer.name,
        debtorId: debt.debtor.id,
        debtorName: debt.debtor.name,
      })),
    },
    resolver: zodResolver(expenseSettlementFormSchema),
  });

  const { fields: debtsFields } = useFieldArray({
    control: form.control,
    name: 'debts',
    keyName: 'fieldId',
  });

  const selectedDebts = form.watch('debts').filter((debt) => debt.selected);

  const filteredParamUserDebts = selectedDebts.filter((debt) => debt.debtorId === paramUser?.id);
  const filteredCurrentUserDebts = selectedDebts.filter((debt) => debt.debtorId === currentUser?.id);

  const paramUserTotalAmount = filteredParamUserDebts.reduce(
    (acc, cur) => Decimal.add(acc, Decimal.sub(cur.amount, cur.settled)),
    new Decimal(0),
  );
  const currentUserTotalAmount = filteredCurrentUserDebts.reduce(
    (acc, cur) => Decimal.add(acc, Decimal.sub(cur.amount, cur.settled)),
    new Decimal(0),
  );

  const totalDiff = currentUserTotalAmount.greaterThan(paramUserTotalAmount)
    ? Decimal.sub(currentUserTotalAmount, paramUserTotalAmount).toFixed(2)
    : Decimal.sub(paramUserTotalAmount, currentUserTotalAmount).toFixed(2);

  const payer = currentUserTotalAmount.greaterThan(paramUserTotalAmount) ? paramUser : currentUser;
  const debtor = currentUserTotalAmount.greaterThan(paramUserTotalAmount) ? currentUser : paramUser;

  const handleSettlement = (values: ExpenseSettlementFormSchema) => {
    const expenseDebts = values.debts
      .filter((debt) => debt.selected)
      .map((debt) => {
        return {
          id: debt.id,
          settled: debt.amount,
        };
      });

    settlement({
      expenseDebts,
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSettlement)}>
        <Heading variant="h2">{paramUser?.name}</Heading>

        <div className="space-y-2">
          <Label className="text-base">Podsumowanie</Label>
          <div className="grid grid-cols-5 place-items-center rounded-md border p-4">
            <div className="text-sm text-muted-foreground">{debtor?.name}</div>
            <ChevronRight />
            <div className="text-sm text-muted-foreground">{totalDiff} zł</div>
            <ChevronRight />
            <div className="text-sm text-muted-foreground">{payer?.name}</div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button>
              {isPendingSettleExpenseDebts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rozlicz
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base">Wydatki</Label>
          {debtsFields.map((item, index) => (
            <FormField
              key={item.id}
              control={form.control}
              name={`debts.${index}.selected`}
              render={({ field }) => {
                return (
                  <FormItem className="space-y-2 rounded-md border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <FormLabel className="font-normal">
                        <div className="line-clamp-1">{item.name}</div>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          className="h-6 w-6"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                      </FormControl>
                    </div>
                    <div className="grid grid-cols-5 place-items-center">
                      <div className="text-sm text-muted-foreground">{item.debtorName}</div>
                      <ChevronRight />
                      <div className="text-sm text-muted-foreground">
                        {(Number(item.amount) - Number(item.settled)).toFixed(2)} zł
                      </div>
                      <ChevronRight />
                      <div className="text-sm text-muted-foreground">{item.payerName}</div>
                    </div>
                  </FormItem>
                );
              }}
            />
          ))}
          <FormMessage className="text-center" />
        </div>
      </form>
    </Form>
  );
}
