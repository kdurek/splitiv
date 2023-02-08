import { api } from "utils/api";

function useUpdateRecipe() {
  const utils = api.useContext();

  return api.recipe.updateRecipe.useMutation({
    async onSuccess(input) {
      await utils.recipe.getRecipeBySlug.invalidate({ slug: input.slug });
    },
  });
}

export { useUpdateRecipe };
