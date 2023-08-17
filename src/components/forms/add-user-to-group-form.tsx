'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { useAddUserToGroup } from 'hooks/use-add-user-to-group';
import { useForm } from 'react-hook-form';
import type { GetUsers } from 'utils/api';
import { z } from 'zod';

const addUserToGroupFormSchema = z.object({
  userId: z.string({ required_error: 'Musisz wybrać użytkownika' }),
});

type AddUserToGroupFormSchema = z.infer<typeof addUserToGroupFormSchema>;

interface AddUserToGroupFormProps {
  users: GetUsers;
}

export function AddUserToGroupForm({ users }: AddUserToGroupFormProps) {
  const { mutate: addUserToGroup } = useAddUserToGroup();

  const form = useForm<AddUserToGroupFormSchema>({
    resolver: zodResolver(addUserToGroupFormSchema),
  });

  const handleAddUserToGroup = (values: AddUserToGroupFormSchema) => {
    addUserToGroup({ userId: values.userId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAddUserToGroup)}>
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz użytkownika" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button>Dodaj</Button>
        </div>
      </form>
    </Form>
  );
}
