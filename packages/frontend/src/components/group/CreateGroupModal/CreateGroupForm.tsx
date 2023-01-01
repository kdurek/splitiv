import { Button, Group, Paper, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";

import { useCreateGroup } from "hooks/useCreateGroup";

interface CreateGroupFormValues {
  name: string;
}

interface CreateGroupFormProps {
  afterSubmit: () => void;
}

function CreateGroupForm({ afterSubmit }: CreateGroupFormProps) {
  const { handleSubmit, register, reset } = useForm<CreateGroupFormValues>();
  const { mutate: createGroup } = useCreateGroup();

  const onSubmit = (values: CreateGroupFormValues) => {
    const { name } = values;
    createGroup({ name });
    reset();
    if (afterSubmit) {
      afterSubmit();
    }
  };

  return (
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
  );
}

export default CreateGroupForm;
