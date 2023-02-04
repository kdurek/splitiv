import { trpc } from "utils/trpc";

function useCreateRecipe() {
  const utils = trpc.useContext();

  return trpc.recipe.createRecipe.useMutation({
    async onSuccess() {
      await utils.recipe.getRecipes.invalidate();
    },
  });
}

export { useCreateRecipe };
