import { useRouter } from "next/router";

import RecipeForm from "components/RecipeForm";
import { useCreateRecipe } from "hooks/useCreateRecipe";

import type { RecipeFormValues } from "components/RecipeForm/RecipeFormSchema";
import type { UseFormReturn } from "react-hook-form";

function CreateRecipeForm() {
  const router = useRouter();
  const { mutate: createRecipe, isLoading: isLoadingCreateRecipe } =
    useCreateRecipe();
  const defaultValues = {
    name: "",
    ingredients: [{ name: "", amount: 1, unit: "gram" }],
    steps: [{ name: "" }],
  };

  const onSubmit = (
    values: RecipeFormValues,
    methods: UseFormReturn<RecipeFormValues>
  ) => {
    createRecipe(
      {
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
      formTitle="Tworzenie przepisu"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isSubmitting={isLoadingCreateRecipe}
      submitButtonText="Dodaj"
    />
  );
}

export default CreateRecipeForm;
