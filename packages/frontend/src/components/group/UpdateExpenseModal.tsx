import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import FormModal from "components/FormModal";
import { GetExpensesByGroup } from "utils/trpc";

import { useUpdateExpense } from "../../hooks/useUpdateExpense";

interface UpdateExpenseFormValues {
  name: string;
}

interface UpdateExpenseModalProps {
  expense: GetExpensesByGroup[number];
}

function UpdateExpenseModal({ expense }: UpdateExpenseModalProps) {
  const methods = useForm<UpdateExpenseFormValues>({
    defaultValues: { name: "Płatność" },
  });

  const { mutate: updateExpense } = useUpdateExpense();

  const { register, setValue } = methods;

  useEffect(() => {
    setValue("name", expense.name);
  }, [expense.name, setValue]);

  const onSubmit: SubmitHandler<UpdateExpenseFormValues> = (values) => {
    if (!expense?.id) {
      throw new Error("expenseId not defined");
    }

    const { name } = values;

    updateExpense({ expenseId: expense.id, name });
  };

  return (
    <FormModal<UpdateExpenseFormValues>
      modalButtonText="Edytuj płatność"
      headerText="Edytowanie wydatku"
      cancelButtonText="Anuluj"
      submitButtonText="Edytuj"
      methods={methods}
      onSubmit={onSubmit}
    >
      <FormControl>
        <FormLabel htmlFor="name">Nazwa</FormLabel>
        <Input
          {...register("name", {
            required: "Pole jest wymagane",
            minLength: {
              value: 3,
              message: "Minimum length should be 3",
            },
          })}
          placeholder="Wprowadź nazwę"
        />
      </FormControl>
    </FormModal>
  );
}

export default UpdateExpenseModal;
