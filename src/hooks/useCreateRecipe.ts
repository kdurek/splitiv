import { api } from "utils/api";

function useCreateRecipe() {
  const utils = api.useContext();

  return api.recipe.createRecipe.useMutation({
    async onSuccess() {
      await utils.recipe.getRecipes.invalidate();
    },
  });
}

export { useCreateRecipe };
