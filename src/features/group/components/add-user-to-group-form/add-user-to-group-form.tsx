import { Button, Group, NativeSelect, Paper } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";

import { useActiveGroup } from "features/group/active-group.context";
import { useAddUserToGroup } from "features/group/api/use-add-user-to-group";
import { api } from "utils/api";

const addUserToGroupFormSchema = z.object({
  userId: z.string({ required_error: "Musisz wybrać użytkownika" }),
});

type AddUserToGroupFormSchema = z.infer<typeof addUserToGroupFormSchema>;

interface AddUserToGroupFormProps {
  onSubmit?: () => void;
}

export function AddUserToGroupForm({ onSubmit }: AddUserToGroupFormProps) {
  const { id: groupId } = useActiveGroup();
  const { mutate: addUserToGroup } = useAddUserToGroup();

  const form = useForm<AddUserToGroupFormSchema>({
    validate: zodResolver(addUserToGroupFormSchema),
  });

  const {
    data: usersNotInGroup,
    isLoading,
    isError,
  } = api.user.getAllNotInGroup.useQuery(
    {
      groupId,
    },
    {
      onSuccess: (data) => {
        form.setValues({ userId: data[0]?.id });
      },
    }
  );

  const handleAddUserToGroup = (values: AddUserToGroupFormSchema) => {
    addUserToGroup(
      { userId: values.userId, groupId },
      {
        onSuccess: () => {
          if (onSubmit) {
            onSubmit();
          }
        },
      }
    );
  };

  if (isLoading) return null;
  if (isError) return null;

  const usersToSelect = usersNotInGroup.map((user) => ({
    value: user.id,
    label: user.name ?? "",
  }));

  return (
    <Paper component="form" onSubmit={form.onSubmit(handleAddUserToGroup)}>
      <NativeSelect
        withAsterisk
        label="Wybierz użytkownika"
        data={usersToSelect}
        {...form.getInputProps("userId")}
      />
      <Group mt={24} position="right">
        <Button variant="default" type="submit">
          Dodaj
        </Button>
      </Group>
    </Paper>
  );
}
