import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router";

import RecipeForm from "components/RecipeForm";
import { RecipeFormValues } from "components/RecipeForm/RecipeFormSchema";
import { useUpdateRecipe } from "hooks/useUpdateRecipe";

export interface UpdateRecipeFormProps {
  recipe: RecipeFormValues & { id: string };
}

function UpdateRecipeForm({ recipe }: UpdateRecipeFormProps) {
  const navigate = useNavigate();
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
          navigate(`/przepisy/${v.slug}`, { replace: true });
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
