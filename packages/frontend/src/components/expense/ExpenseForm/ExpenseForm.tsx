import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Paper } from "@mantine/core";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { GetGroupById } from "utils/trpc";

import ExpenseFormDetails from "./ExpenseFormDetails";
import ExpenseFormMethodTabs from "./ExpenseFormMethodTabs";
import { ExpenseFormSchema, ExpenseFormValues } from "./ExpenseFormSchema";

interface ExpenseFormProps {
  group: GetGroupById;
  defaultValues: ExpenseFormValues;
  onSubmit: SubmitHandler<ExpenseFormValues>;
  afterSubmit: () => void;
  submitButtonText: string;
}

function ExpenseForm({
  group,
  defaultValues,
  onSubmit,
  afterSubmit,
  submitButtonText,
}: ExpenseFormProps) {
  const methods = useForm<ExpenseFormValues>({
    defaultValues,
    resolver: zodResolver(ExpenseFormSchema),
  });

  const { handleSubmit, reset } = methods;

  const handleOnSubmit: SubmitHandler<ExpenseFormValues> = (values) => {
    onSubmit(values);
    reset();
    afterSubmit();
  };

  if (!group) return null;

  return (
    <FormProvider {...methods}>
      <Paper component="form" onSubmit={handleSubmit(handleOnSubmit)}>
        <ExpenseFormDetails group={group} />
        <ExpenseFormMethodTabs />
        <Group mt={24} position="right">
          <Button variant="default" type="submit">
            {submitButtonText}
          </Button>
        </Group>
      </Paper>
    </FormProvider>
  );
}

export default ExpenseForm;
