"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { type GetGroups, api } from "utils/api";

const groupSelectFormSchema = z.object({
  groupId: z.string({ required_error: "Musisz wybrać grupę" }),
});

type GroupSelectFormSchema = z.infer<typeof groupSelectFormSchema>;

interface GroupSelectFormProps {
  groups: GetGroups;
}

export function GroupSelectForm({ groups }: GroupSelectFormProps) {
  const form = useForm<GroupSelectFormSchema>({
    resolver: zodResolver(groupSelectFormSchema),
  });

  const { mutate: changeActiveGroup } =
    api.user.changeActiveGroup.useMutation();

  const handleGroupSelect = (values: GroupSelectFormSchema) => {
    changeActiveGroup({ groupId: values.groupId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleGroupSelect)}>
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktywna grupa</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz grupę" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end mt-6">
          <Button type="submit">Wybierz</Button>
        </div>
      </form>
    </Form>
  );
}