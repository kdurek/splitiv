import { api } from "utils/api";

export function useDeleteRecipeBySlug() {
  const utils = api.useContext();

  return api.recipe.deleteRecipeBySlug.useMutation({
    async onSuccess(input) {
      await utils.recipe.getRecipes.invalidate();
      await utils.recipe.getRecipeBySlug.invalidate({ slug: input.slug });
    },
  });
}