import { Button, Group, Modal, Paper, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useUpdateExpense } from "hooks/useUpdateExpense";
import { GetExpensesByGroup } from "utils/trpc";

interface UpdateExpenseFormValues {
  name: string;
}

interface UpdateExpenseModalProps {
  expense: GetExpensesByGroup[number];
}

function UpdateExpenseModal({ expense }: UpdateExpenseModalProps) {
  const [opened, setOpened] = useState(false);
  const { handleSubmit, register, reset, setValue } =
    useForm<UpdateExpenseFormValues>({
      defaultValues: { name: "Płatność" },
    });

  const { mutate: updateExpense } = useUpdateExpense();

  useEffect(() => {
    setValue("name", expense.name);
  }, [expense.name, setValue]);

  const onSubmit: SubmitHandler<UpdateExpenseFormValues> = (values) => {
    const { name } = values;
    updateExpense({ expenseId: expense.id, name });
    reset();
    setOpened(false);
  };

  return (
    <>
      <Button variant="default" onClick={() => setOpened(true)}>
        Edytuj płatność
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edytowanie wydatku"
      >
        <Paper component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            {...register("name", {
              required: "Pole jest wymagane",
              minLength: {
                value: 3,
                message: "Minimum length should be 3",
              },
            })}
            label="Nazwa"
          />
          <Group mt={24} position="right">
            <Button variant="default" type="submit">
              Edytuj
            </Button>
          </Group>
        </Paper>
      </Modal>
    </>
  );
}

export default UpdateExpenseModal;
