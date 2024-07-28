'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Gender } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { genderSelectFormSchema } from '@/lib/validations/user';
import { api } from '@/trpc/react';

type GenderSelectFormSchema = z.infer<typeof genderSelectFormSchema>;

interface GenderSelectFormProps {
  userId: string;
}

export function GenderSelectForm({ userId }: GenderSelectFormProps) {
  const t = useTranslations('GenderSelectForm');

  const router = useRouter();

  const form = useForm<GenderSelectFormSchema>({
    resolver: zodResolver(genderSelectFormSchema),
  });

  const { mutate: updateUser } = api.user.update.useMutation();

  const handleUpdateGender = (values: GenderSelectFormSchema) => {
    updateUser(
      {
        userId: userId,
        userData: { gender: values.gender },
      },
      {
        onSuccess() {
          toast.success(t('success'));
          router.refresh();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateGender)}>
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>{t('male')}</SelectItem>
                  <SelectItem value={Gender.FEMALE}>{t('female')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button>{t('submit')}</Button>
        </div>
      </form>
    </Form>
  );
}
