'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateUser } from '@/hooks/use-update-user';
import { GetUserById } from '@/utils/api';

const updateUserFormSchema = z.object({
  name: z
    .string({ required_error: 'Musisz podać imię i nazwisko' })
    .min(3, 'Minimalna długość to 3 znaki')
    .refine((value) => value.split(' ').length === 2, { message: 'Musisz podać imię i nazwisko' }),
});

type UpdateUserFormSchema = z.infer<typeof updateUserFormSchema>;

interface UserFormProps {
  user: GetUserById;
}

export function UserForm({ user }: UserFormProps) {
  const defaultValues = user
    ? {
        name: user.name || '',
      }
    : {
        name: '',
      };

  const form = useForm<UpdateUserFormSchema>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues,
  });

  const { mutate: updateUser } = useUpdateUser();

  const handleUpdateUser = async (values: UpdateUserFormSchema) => {
    if (user) {
      updateUser({ userId: user.id, name: values.name });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateUser)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię i nazwisko</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button>Zapisz</Button>
        </div>
      </form>
    </Form>
  );
}
