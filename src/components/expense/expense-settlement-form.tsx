'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Heading } from '@/components/ui/heading';
import { Label } from '@/components/ui/label';
import { expenseSettlementFormSchema } from '@/lib/validations/expense-settlement';
import type { ExpenseDebtSettlement, UserById } from '@/trpc/react';
import { api } from '@/trpc/react';

type ExpenseSettlementFormSchema = z.infer<typeof expenseSettlementFormSchema>;

interface ExpenseSettlementFormProps {
  paramsUser: UserById;
  usersDebts: ExpenseDebtSettlement;
}

export function ExpenseSettlementForm({ paramsUser, usersDebts }: ExpenseSettlementFormProps) {
  const [currentUser] = api.user.current.useSuspenseQuery();

  const router = useRouter();

  const { mutate: settlement, isPending: isPendingSettleExpenseDebts } = api.expense.debt.settle.useMutation();

  const form = useForm<ExpenseSettlementFormSchema>({
    values: {
      debts: usersDebts.flatMap((debt) => ({
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

  useEffect(() => {
    if (!usersDebts.length) {
      router.push('/');
    }
  }, [router, usersDebts.length]);

  const selectedDebts = form.watch('debts').filter((debt) => debt.selected);

  const filteredParamUserDebts = selectedDebts.filter((debt) => debt.debtorId === paramsUser?.id);
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

  const payer = currentUserTotalAmount.greaterThan(paramUserTotalAmount) ? paramsUser : currentUser;
  const debtor = currentUserTotalAmount.greaterThan(paramUserTotalAmount) ? currentUser : paramsUser;

  const handleSettlement = (values: ExpenseSettlementFormSchema) => {
    const expenseDebts = values.debts
      .filter((debt) => debt.selected)
      .map((debt) => {
        return {
          id: debt.id,
          settled: debt.amount,
        };
      });

    settlement(
      {
        expenseDebts,
      },
      {
        onSuccess() {
          toast.success('Pomyślnie rozliczono długi');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form id="expense-settlement-form" className="space-y-6" onSubmit={form.handleSubmit(handleSettlement)}>
        <Heading variant="h2">{paramsUser?.name}</Heading>

        <div className="space-y-4">
          <Label className="text-base">Podsumowanie</Label>
          <div className="grid grid-cols-5 place-items-center rounded-md bg-white p-4">
            <div className="text-sm text-muted-foreground">{debtor?.name}</div>
            <ChevronRight />
            <div className="text-sm text-muted-foreground">{totalDiff} zł</div>
            <ChevronRight />
            <div className="text-sm text-muted-foreground">{payer?.name}</div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Rozlicz</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rozliczenie</AlertDialogTitle>
                  <AlertDialogDescription>Czy na pewno chcesz się rozliczyć?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Nie</AlertDialogCancel>
                  <AlertDialogAction type="submit" form="expense-settlement-form">
                    {isPendingSettleExpenseDebts && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Tak
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base">Wydatki</Label>
          {debtsFields.map((item, index) => (
            <FormField
              key={item.id}
              control={form.control}
              name={`debts.${index}.selected`}
              render={({ field }) => {
                return (
                  <FormItem className="space-y-2 rounded-md bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <FormLabel className="font-normal">
                        <div className="line-clamp-1">{item.name}</div>
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          className="size-6"
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
