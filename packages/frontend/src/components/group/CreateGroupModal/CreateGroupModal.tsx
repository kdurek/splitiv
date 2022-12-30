import { Button, Group, Modal, Paper, TextInput } from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useCreateGroup } from "hooks/useCreateGroup";

interface CreateGroupFormValues {
  name: string;
}

function CreateGroupModal() {
  const [opened, setOpened] = useState(false);
  const { handleSubmit, register, reset } = useForm<CreateGroupFormValues>();
  const { mutate: createGroup } = useCreateGroup();

  const onSubmit = (values: CreateGroupFormValues) => {
    const { name } = values;
    createGroup({ name });
    reset();
    setOpened(false);
  };

  return (
    <>
      <Button variant="default" onClick={() => setOpened(true)}>
        Stwórz grupę
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Tworzenie grupy"
      >
        <Paper component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            {...register("name", {
              required: "Pole jest wymagane",
              minLength: { value: 3, message: "Minimum length should be 3" },
            })}
            label="Nazwa grupy"
            withAsterisk
          />
          <Group mt={24} position="right">
            <Button variant="default" type="submit">
              Stwórz
            </Button>
          </Group>
        </Paper>
      </Modal>
    </>
  );
}

export default CreateGroupModal;
