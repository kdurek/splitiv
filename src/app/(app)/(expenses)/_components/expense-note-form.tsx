'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { useCreateExpenseNote } from '@/app/_components/hooks/use-create-expense-note';
import { Button } from '@/app/_components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { expenseNoteFormSchema } from '@/lib/validations/expense-note';

type ExpenseNoteFormSchema = z.infer<typeof expenseNoteFormSchema>;

interface ExpenseNoteFormProps {
  expenseId: string;
}

export function ExpenseNoteForm({ expenseId }: ExpenseNoteFormProps) {
  const form = useForm<ExpenseNoteFormSchema>({
    defaultValues: {
      content: '',
    },
    resolver: zodResolver(expenseNoteFormSchema),
  });

  const { mutate: createExpenseNote } = useCreateExpenseNote();

  const handleCreateExpenseNote = (values: ExpenseNoteFormSchema) => {
    createExpenseNote(
      { expenseId, content: values.content },
      {
        onSuccess() {
          toast.success('Pomyślnie dodano notatkę');
          form.reset();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateExpenseNote)} className="space-y-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="O czym chcesz wspomnieć?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full">Dodaj</Button>
      </form>
    </Form>
  );
}
