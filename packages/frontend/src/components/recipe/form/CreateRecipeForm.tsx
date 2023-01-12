import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Paper, Stack, Title } from "@mantine/core";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { useCreateRecipe } from "hooks/useCreateRecipe";

import RecipeDetailsForm from "./RecipeDetailsForm";
import { RecipeFormSchema, RecipeFormValues } from "./RecipeFormSchema";
import RecipeIngredientsForm from "./RecipeIngredientsForm";
import RecipeStepsForm from "./RecipeStepsForm";

function CreateRecipeForm() {
  const navigate = useNavigate();
  const { mutate: createRecipe } = useCreateRecipe();

  const methods = useForm({
    defaultValues: {
      name: "",
      ingredients: [{ name: "", amount: 1, unit: "gram" }],
      steps: [{ name: "" }],
    },
    resolver: zodResolver(RecipeFormSchema),
  });

  const { handleSubmit, setError } = methods;

  const onSubmit: SubmitHandler<RecipeFormValues> = (values) => {
    createRecipe(
      {
        name: values.name,
        ingredients: values.ingredients,
        steps: values.steps,
      },
      {
        onSuccess: (v) => navigate(`/przepisy/${v.slug}`, { replace: true }),
        onError: (v) => setError("name", { message: v.message }),
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <Paper component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Title order={1}>Tworzenie przepisu</Title>
          <RecipeDetailsForm />
          <RecipeIngredientsForm />
          <RecipeStepsForm />
          <Button type="submit">Dodaj</Button>
        </Stack>
      </Paper>
    </FormProvider>
  );
}

export default CreateRecipeForm;
