'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'components/ui/button';
import { CurrencyInput } from 'components/ui/currency-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/ui/form';
import { Input } from 'components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Textarea } from 'components/ui/textarea';
import { useCreateExpense } from 'hooks/use-create-expense';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { GetGroupById } from 'utils/api';

import { type ExpenseFormSchema, expenseFormSchema } from './expense-form.schema';
import { ExpenseFormMethods } from './expense-form-methods';

interface ExpenseFormProps {
  group: GetGroupById;
}

export function ExpenseForm({ group }: ExpenseFormProps) {
  const router = useRouter();
  const { mutate: createExpense, isLoading: isLoadingCreateExpense } = useCreateExpense();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      amount: parseFloat('0').toFixed(2),
      payer: '',
      debts: group.members.map((member) => ({
        id: member.id,
        name: member.name || '',
        amount: parseFloat('0').toFixed(2),
      })),
    },
    resolver: zodResolver(expenseFormSchema),
  });

  const handleOnSubmit = (values: ExpenseFormSchema) => {
    const formattedDebts = values.debts
      .filter((debt) => parseFloat(debt.amount) !== 0 || (values.payer === debt.id && parseFloat(debt.amount) !== 0))
      .map((debt) => {
        const isPayer = values.payer === debt.id;

        return {
          settled: isPayer ? parseFloat(debt.amount) : 0,
          amount: values.amount ? parseFloat(debt.amount) : 0,
          debtorId: debt.id,
        };
      });

    createExpense(
      {
        name: values.name,
        description: values.description,
        amount: parseFloat(values.amount),
        payerId: values.payer,
        debts: formattedDebts,
      },
      {
        onSuccess() {
          router.push('/');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Czego dotyczy wydatek?</FormLabel>
              <FormControl>
                <Input placeholder="Wprowadź nazwę" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opcjonalny opis</FormLabel>
              <FormControl>
                <Textarea placeholder="Wprowadź szczegóły (opcjonalne)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Całkowita kwota wydatku</FormLabel>
              <FormControl>
                <CurrencyInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kto zapłacił za wydatek?</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz osobę" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {group.members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <FormLabel>Kto uczestniczył w wydatku?</FormLabel>
          <ExpenseFormMethods />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button>
            {isLoadingCreateExpense && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Potwierdź
          </Button>
        </div>
      </form>
    </Form>
  );
}
