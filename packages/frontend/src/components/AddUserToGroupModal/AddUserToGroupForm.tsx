import { Button, Group, NativeSelect, Paper } from "@mantine/core";
import { useForm } from "react-hook-form";

import { useAddUserToGroup } from "hooks/useAddUserToGroup";
import { useUsers } from "hooks/useUsers";
import { GetGroupById } from "utils/trpc";

interface AddUserToGroupFormValues {
  name: string;
  user: string;
}

interface AddUserToGroupFormProps {
  group: GetGroupById;
  afterSubmit?: () => void;
}

function AddUserToGroupForm({ group, afterSubmit }: AddUserToGroupFormProps) {
  const { mutate: addUserToGroup } = useAddUserToGroup();
  const { handleSubmit, register, reset } = useForm<AddUserToGroupFormValues>({
    defaultValues: { name: "Płatność" },
  });

  const { data: users } = useUsers();

  if (!group || !users) return null;

  const onSubmit = (values: AddUserToGroupFormValues) => {
    addUserToGroup({ userId: values.user, groupId: group.id });
    reset();
    if (afterSubmit) {
      afterSubmit();
    }
  };

  const groupUsers = group.members.map((user) => user.id);
  const usersNotInGroup = users
    .filter((user) => !groupUsers.includes(user.id))
    .map((user) => ({ value: user.id, label: user.name }));

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

export default AddUserToGroupForm;
