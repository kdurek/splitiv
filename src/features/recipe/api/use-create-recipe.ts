import { api } from "utils/api";

export function useCreateRecipe() {
  const utils = api.useContext();

  return api.recipe.createRecipe.useMutation({
    async onSuccess() {
      await utils.recipe.getRecipes.invalidate();
    },
  });
}
