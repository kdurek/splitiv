import { trpc } from "utils/trpc";

function useCreateRecipe() {
  const utils = trpc.useContext();

  return trpc.recipe.createRecipe.useMutation({
    onSuccess() {
      utils.recipe.getRecipes.invalidate();
    },
  });
}

export { useCreateRecipe };
