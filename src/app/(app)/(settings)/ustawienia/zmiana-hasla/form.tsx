'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth';
import { changePasswordFormSchema } from '@/lib/validations/auth';
import { api } from '@/trpc/react';

export function ChangePasswordForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: setPassword, isPending: isPendingSetPassword } = api.user.setPassword.useMutation();
  const [isPendingChangePassword, setIsPendingChangePassword] = useState(false);

  const handleChangeOrSetPassword = async (values: z.infer<typeof changePasswordFormSchema>) => {
    const { data: accounts } = await authClient.listAccounts();
    const hasPassword = accounts?.some((account) => account.provider === 'credential');

    if (hasPassword) {
      if (!values.currentPassword) {
        return form.setError('currentPassword', {
          message: 'Podaj aktualne hasło',
        });
      }

      await authClient.changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.password,
          revokeOtherSessions: true,
        },
        {
          onRequest() {
            setIsPendingChangePassword(true);
          },
          onSuccess() {
            toast.success('Pomyślnie zmieniono hasło');
            router.push('/ustawienia');
          },
          onError() {
            toast.error('Wystąpił błąd podczas zmiany hasła');
            setIsPendingChangePassword(false);
          },
        },
      );
    } else {
      setPassword(
        {
          currentPassword: values.currentPassword,
          password: values.password,
        },
        {
          onSuccess() {
            toast.success('Pomyślnie ustawiono hasło');
            router.push('/ustawienia');
          },
          onError() {
            toast.error('Wystąpił błąd podczas ustawiania hasła');
          },
        },
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleChangeOrSetPassword)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktualne hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potwierdź hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button disabled={isPendingChangePassword || isPendingSetPassword}>Zmień hasło</Button>
        </div>
      </form>
    </Form>
  );
}
