'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import Decimal from 'decimal.js';
import { Loader2 } from 'lucide-react';
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
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { expenseSettlementFormSchema } from '@/lib/validations/expense-settlement';
import { api } from '@/trpc/react';

type ExpenseSettlementFormSchema = z.infer<typeof expenseSettlementFormSchema>;

interface ExpenseSettlementFormProps {
  paramsUserId: string;
}

export function ExpenseSettlementForm({ paramsUserId }: ExpenseSettlementFormProps) {
  const router = useRouter();

  const [usersDebts] = api.expense.debt.getBetweenUser.useSuspenseQuery({
    userId: paramsUserId,
  });

  const { mutate: settleDebtsFully, isPending: isPendingSettleExpenseDebts } =
    api.expense.debt.settleDebtsFully.useMutation();

  const form = useForm<ExpenseSettlementFormSchema>({
    values: {
      credits: usersDebts.credits.map((debt) => ({
        id: debt.id,
        selected: true,
      })),
      debts: usersDebts.debts.map((debt) => ({
        id: debt.id,
        selected: true,
      })),
    },
    resolver: zodResolver(expenseSettlementFormSchema),
  });

  const { fields: creditsFields } = useFieldArray({
    control: form.control,
    name: 'credits',
    keyName: 'fieldId',
  });
  const { fields: debtsFields } = useFieldArray({
    control: form.control,
    name: 'debts',
    keyName: 'fieldId',
  });

  useEffect(() => {
    if (!creditsFields.length && !debtsFields.length) {
      router.push('/');
    }
  }, [router, creditsFields.length, debtsFields.length]);

  const selectedCredits = form.watch('credits').filter((debt) => debt.selected);
  const selectedDebts = form.watch('debts').filter((debt) => debt.selected);

  const summedUsersDebts = new Decimal(
    usersDebts.credits
      .filter((credit) => selectedCredits.map((selectedCredit) => selectedCredit.id).includes(credit.id))
      .reduce((acc, credit) => acc.plus(credit.amount), new Decimal(0)),
  ).minus(
    usersDebts.debts
      .filter((debt) => selectedDebts.map((selectedDebt) => selectedDebt.id).includes(debt.id))
      .reduce((acc, debt) => acc.plus(debt.amount), new Decimal(0)),
  );

  const isPayer = summedUsersDebts.isPositive();

  const handleSettlement = (values: ExpenseSettlementFormSchema) => {
    const expenseDebtIds = [...values.credits, ...values.debts].filter((debt) => debt.selected).map((debt) => debt.id);

    settleDebtsFully(
      {
        expenseDebtIds,
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
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              'flex justify-center rounded-md border p-4',
              isPayer ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500',
            )}
          >
            <div>{`${isPayer ? 'Otrzymasz' : 'Zapłacisz'} ${summedUsersDebts.abs().toFixed(2)} zł`}</div>
          </div>
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
          <Separator />
        </div>

        <div className="divide-y">
          {creditsFields.map((item, index) => (
            <FormField
              key={item.id}
              control={form.control}
              name={`credits.${index}.selected`}
              render={({ field }) => {
                const credit = usersDebts.credits.find((credit) => credit.id === item.id);
                if (!credit) return <div />;
                return (
                  <FormItem className="flex items-center justify-between overflow-hidden py-4">
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Checkbox
                          className="size-6"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                      </FormControl>
                      <div className="overflow-hidden text-start">
                        <div className="line-clamp-1">{credit.expense.name}</div>
                        <div className="line-clamp-1 text-sm text-muted-foreground">
                          {format(credit.createdAt, 'EEEEEE, d MMMM')}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden text-end">
                      <div className={cn('whitespace-nowrap text-green-500')}>
                        {Number(Decimal.sub(credit.amount, credit.settled)).toFixed(2)} zł
                      </div>
                      <div className={cn('whitespace-nowrap text-sm text-muted-foreground')}>
                        {Number(credit.expense.amount).toFixed(2)} zł
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
          ))}
          {debtsFields.map((item, index) => (
            <FormField
              key={item.id}
              control={form.control}
              name={`debts.${index}.selected`}
              render={({ field }) => {
                const debt = usersDebts.debts.find((credit) => credit.id === item.id);
                if (!debt) return <div />;
                return (
                  <FormItem className="flex items-center justify-between overflow-hidden py-4">
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Checkbox
                          className="size-6"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                      </FormControl>
                      <div className="overflow-hidden text-start">
                        <div className="line-clamp-1">{debt.expense.name}</div>
                        <div className="line-clamp-1 text-sm text-muted-foreground">
                          {format(debt.createdAt, 'EEEEEE, d MMMM')}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden text-end">
                      <div className={cn('whitespace-nowrap text-red-500')}>
                        {Number(Decimal.sub(debt.amount, debt.settled)).toFixed(2)} zł
                      </div>
                      <div className={cn('whitespace-nowrap text-sm text-muted-foreground')}>
                        {Number(debt.expense.amount).toFixed(2)} zł
                      </div>
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
