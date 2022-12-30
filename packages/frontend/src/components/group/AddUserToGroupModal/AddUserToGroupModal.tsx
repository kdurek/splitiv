import { Button, Group, Modal, NativeSelect, Paper } from "@mantine/core";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useAddUserToGroup } from "hooks/useAddUserToGroup";
import { GetUsers } from "utils/trpc";

interface AddUserToGroupFormValues {
  name: string;
  user: string;
}

interface AddUserToGroupModalProps {
  groupId: string;
  members: GetUsers;
  users: GetUsers;
}

function AddUserToGroupModal({
  groupId,
  members,
  users,
}: AddUserToGroupModalProps) {
  const [opened, setOpened] = useState(false);
  const { mutate: addUserToGroup } = useAddUserToGroup();
  const { handleSubmit, register, reset } = useForm<AddUserToGroupFormValues>({
    defaultValues: { name: "Płatność" },
  });

  const onSubmit: SubmitHandler<AddUserToGroupFormValues> = (values) => {
    addUserToGroup({ userId: values.user, groupId });
    reset();
    setOpened(false);
  };

  const groupUsers = members.map((user) => user.id);
  const usersNotInGroup = users
    .filter((user) => !groupUsers.includes(user.id))
    .map((user) => ({ value: user.id, label: user.name }));

  return (
    <>
      <Button variant="default" onClick={() => setOpened(true)}>
        Dodaj użytkownika
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Dodawanie użytkownika"
      >
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
      </Modal>
    </>
  );
}

export default AddUserToGroupModal;
