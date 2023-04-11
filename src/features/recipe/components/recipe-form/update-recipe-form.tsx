import { useRouter } from "next/router";

import { useUpdateRecipe } from "features/recipe/api/use-update-recipe";

import { RecipeForm } from "./recipe-form";

import type { RecipeFormValues } from "./recipe-form.schema";
import type { UseFormReturn } from "react-hook-form";

export interface UpdateRecipeFormProps {
  recipe: RecipeFormValues & { id: string };
}

export function UpdateRecipeForm({ recipe }: UpdateRecipeFormProps) {
  const router = useRouter();
  const { mutate: updateRecipe, isLoading: isLoadingUpdateRecipe } =
    useUpdateRecipe();

  const onSubmit = (
    values: RecipeFormValues,
    methods: UseFormReturn<RecipeFormValues>
  ) => {
    updateRecipe(
      {
        id: recipe.id,
        name: values.name,
        ingredients: values.ingredients,
        steps: values.steps,
      },
      {
        onSuccess(v) {
          router.replace(`/przepisy/${v.slug}`);
        },
        onError(v) {
          methods.setError("name", { message: v.message });
        },
      }
    );
  };

  return (
    <RecipeForm
      formTitle="Edycja przepisu"
      defaultValues={recipe}
      onSubmit={onSubmit}
      isSubmitting={isLoadingUpdateRecipe}
      submitButtonText="Zapisz"
    />
  );
}
