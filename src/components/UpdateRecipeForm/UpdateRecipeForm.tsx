import { useRouter } from "next/router";

import RecipeForm from "components/RecipeForm";
import { useUpdateRecipe } from "hooks/useUpdateRecipe";

import type { RecipeFormValues } from "components/RecipeForm/RecipeFormSchema";
import type { UseFormReturn } from "react-hook-form";

export interface UpdateRecipeFormProps {
  recipe: RecipeFormValues & { id: string };
}

function UpdateRecipeForm({ recipe }: UpdateRecipeFormProps) {
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

export default UpdateRecipeForm;
