import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router";

import RecipeForm from "components/RecipeForm";
import { RecipeFormValues } from "components/RecipeForm/RecipeFormSchema";
import { useCreateRecipe } from "hooks/useCreateRecipe";

function CreateRecipeForm() {
  const navigate = useNavigate();
  const { mutate: createRecipe } = useCreateRecipe();
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
        onSuccess: (v) => navigate(`/przepisy/${v.slug}`, { replace: true }),
        onError: (v) => methods.setError("name", { message: v.message }),
      }
    );
  };

  return (
    <RecipeForm
      formTitle="Tworzenie przepisu"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitButtonText="Dodaj"
    />
  );
}

export default CreateRecipeForm;
