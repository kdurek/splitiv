import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Paper, Stack, Title } from "@mantine/core";
import { FormProvider, UseFormReturn, useForm } from "react-hook-form";

import RecipeDetails from "./RecipeDetails";
import { RecipeFormSchema, RecipeFormValues } from "./RecipeFormSchema";
import RecipeIngredients from "./RecipeIngredients";
import RecipeSteps from "./RecipeSteps";

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

function RecipeForm({
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

export default RecipeForm;
