import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Paper, Stack, Title } from "@mantine/core";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { useUpdateRecipe } from "hooks/useUpdateRecipe";

import RecipeDetailsForm from "./RecipeDetailsForm";
import { RecipeFormSchema, RecipeFormValues } from "./RecipeFormSchema";
import RecipeIngredientsForm from "./RecipeIngredientsForm";
import RecipeStepsForm from "./RecipeStepsForm";

export interface UpdateRecipeFormProps {
  recipe: RecipeFormValues & { id: string };
  afterSubmit?: () => void;
}

function UpdateRecipeForm({ recipe, afterSubmit }: UpdateRecipeFormProps) {
  const navigate = useNavigate();
  const { mutate: updateRecipe } = useUpdateRecipe();
  const methods = useForm({
    defaultValues: recipe,
    resolver: zodResolver(RecipeFormSchema),
  });

  const { handleSubmit, setError } = methods;

  const onSubmit: SubmitHandler<RecipeFormValues> = (values) => {
    updateRecipe(
      {
        id: recipe.id,
        name: values.name,
        ingredients: values.ingredients,
        steps: values.steps,
      },
      {
        onSuccess: (v) => {
          if (recipe.name !== v.name) {
            navigate(`/przepisy/${v.slug}`, { replace: true });
          }
          if (afterSubmit) {
            afterSubmit();
          }
        },
        onError: (v) => setError("name", { message: v.message }),
      }
    );
  };

  return (
    <Paper component="form" onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <Stack>
          <Title order={1}>Edycja przepisu</Title>
          <RecipeDetailsForm />
          <RecipeIngredientsForm />
          <RecipeStepsForm />
          <Button type="submit">Zapisz</Button>
        </Stack>
      </FormProvider>
    </Paper>
  );
}

export default UpdateRecipeForm;
