import { Button, Group, NativeSelect, Paper } from "@mantine/core";
import { useForm } from "react-hook-form";

import { useActiveGroup } from "features/group/active-group.context";
import { useAddUserToGroup } from "features/group/api/use-add-user-to-group";
import { useUsers } from "features/group/api/use-users";

interface AddUserToGroupFormValues {
  name: string;
  user: string;
}

interface AddUserToGroupFormProps {
  afterSubmit?: () => void;
}

export function AddUserToGroupForm({ afterSubmit }: AddUserToGroupFormProps) {
  const activeGroup = useActiveGroup();
  const { mutate: addUserToGroup } = useAddUserToGroup();
  const { handleSubmit, register, reset } = useForm<AddUserToGroupFormValues>({
    defaultValues: { name: "Płatność" },
  });

  const { data: users } = useUsers();

  if (!users) return null;

  const onSubmit = (values: AddUserToGroupFormValues) => {
    addUserToGroup({ userId: values.user, groupId: activeGroup.id });
    reset();
    if (afterSubmit) {
      afterSubmit();
    }
  };

  const groupUsers = activeGroup.members.map((user) => user.id);
  const usersNotInGroup = users
    .filter((user) => !groupUsers.includes(user.id))
    .map((user) => ({ value: user.id, label: user.name ?? "Brak nazwy" }));

  return (
    <Paper component="form" onSubmit={handleSubmit(onSubmit)}>
      <NativeSelect
        {...register("user", {
          required: "Pole jest wymagane",
        })}
        data={usersNotInGroup}
        label="Wybierz użytkownika"
        withAsterisk
      />
      <Group mt={24} position="right">
        <Button variant="default" type="submit">
          Dodaj
        </Button>
      </Group>
    </Paper>
  );
}
