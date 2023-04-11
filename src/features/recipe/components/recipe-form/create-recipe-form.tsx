import { useRouter } from "next/router";

import { useCreateRecipe } from "../../api/use-create-recipe";

import { RecipeForm } from "./recipe-form";

import type { RecipeFormValues } from "./recipe-form.schema";
import type { UseFormReturn } from "react-hook-form";

export function CreateRecipeForm() {
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
