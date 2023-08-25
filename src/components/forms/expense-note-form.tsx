'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/ui/form';
import { Input } from 'components/ui/input';
import { useCreateExpenseNote } from 'hooks/use-create-expense-note';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const expenseNoteFormSchema = z.object({
  content: z.string().min(3, { message: 'Minimalna długość to 3 znaki' }),
});

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
                <Input {...field} />
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
