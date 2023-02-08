import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Paper } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";

import ExpenseFormDetails from "./ExpenseFormDetails";
import ExpenseFormMethodTabs from "./ExpenseFormMethodTabs";
import { ExpenseFormSchema } from "./ExpenseFormSchema";

import type { ExpenseFormValues } from "./ExpenseFormSchema";
import type { UseFormReturn } from "react-hook-form";
import type { GetGroupById } from "utils/api";

interface ExpenseFormProps {
  group: GetGroupById;
  defaultValues: ExpenseFormValues;
  onSubmit: (
    values: ExpenseFormValues,
    methods: UseFormReturn<ExpenseFormValues>
  ) => void;
  isSubmitting: boolean;
  submitButtonText: string;
}

function ExpenseForm({
  group,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: ExpenseFormProps) {
  const methods = useForm<ExpenseFormValues>({
    defaultValues,
    resolver: zodResolver(ExpenseFormSchema),
  });

  const handleOnSubmit = (values: ExpenseFormValues) =>
    onSubmit(values, methods);

  if (!group) return null;

  return (
    <FormProvider {...methods}>
      <Paper component="form" onSubmit={methods.handleSubmit(handleOnSubmit)}>
        <ExpenseFormDetails group={group} />
        <ExpenseFormMethodTabs group={group} />
        <Group mt={24} position="right">
          <Button loading={isSubmitting} variant="default" type="submit">
            {submitButtonText}
          </Button>
        </Group>
      </Paper>
    </FormProvider>
  );
}

export default ExpenseForm;
