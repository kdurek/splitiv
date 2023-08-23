'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Gender } from '@prisma/client';
import { Button } from 'components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { useUpdateUser } from 'hooks/use-update-user';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const genderSelectFormSchema = z.object({
  gender: z.nativeEnum(Gender, { required_error: 'Musisz wybrać płeć' }),
});

type GenderSelectFormSchema = z.infer<typeof genderSelectFormSchema>;

interface GenderSelectFormProps {
  userId: string;
}

export function GenderSelectForm({ userId }: GenderSelectFormProps) {
  const form = useForm<GenderSelectFormSchema>({
    resolver: zodResolver(genderSelectFormSchema),
  });

  const { mutate: updateUser } = useUpdateUser();

  const handleUpdateGender = (values: GenderSelectFormSchema) => {
    updateUser({ userId: userId, gender: values.gender });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateGender)}>
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Płeć</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz płeć" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Gender['MALE']}>Mężczyzna</SelectItem>
                  <SelectItem value={Gender['FEMALE']}>Kobieta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button>Wybierz</Button>
        </div>
      </form>
    </Form>
  );
}
