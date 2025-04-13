'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth';
import { userInfoSchema } from '@/lib/validations/auth';
import { api } from '@/trpc/react';

export function UserForm() {
  const router = useRouter();
  const [user] = api.user.current.useSuspenseQuery();

  const form = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: user.name ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    },
  });

  const handleUpdateUser = async (values: z.infer<typeof userInfoSchema>) => {
    await authClient.updateUser(
      {
        name: values.name,
        firstName: values.firstName,
        lastName: values.lastName,
      },
      {
        onSuccess() {
          toast.success('Pomyślnie zaktualizowano');
          router.push('/ustawienia');
        },
        onError() {
          toast.error('Wystąpił błąd podczas aktualizacji');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateUser)} className="grid gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwisko</FormLabel>
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
