import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Paper, Stack, Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";

import { RecipeDetails } from "./recipe-form-details";
import { RecipeIngredients } from "./recipe-form-ingredients";
import { RecipeSteps } from "./recipe-form-steps";
import { RecipeFormSchema } from "./recipe-form.schema";

import type { RecipeFormValues } from "./recipe-form.schema";
import type { UseFormReturn } from "react-hook-form";

interface RecipeFormProps {
  formTitle: string;
  defaultValues: RecipeFormValues;
  onSubmit: (
    values: RecipeFormValues,
    methods: UseFormReturn<RecipeFormValues>
  ) => void;
  isSubmitting: boolean;
  submitButtonText: string;
}

export function RecipeForm({
  formTitle,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: RecipeFormProps) {
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(RecipeFormSchema),
  });

  const { handleSubmit } = methods;

  const handleOnSubmit = (values: RecipeFormValues) =>
    onSubmit(values, methods);

  return (
    <FormProvider {...methods}>
      <Paper component="form" onSubmit={handleSubmit(handleOnSubmit)}>
        <Stack>
          <Title order={1}>{formTitle}</Title>
          <RecipeDetails />
          <RecipeIngredients />
          <RecipeSteps />
          <Button loading={isSubmitting} type="submit">
            {submitButtonText}
          </Button>
        </Stack>
      </Paper>
    </FormProvider>
  );
}
