import { trpc } from "utils/trpc";

function useDeleteRecipeBySlug() {
  const utils = trpc.useContext();

  return trpc.recipe.deleteRecipeBySlug.useMutation({
    async onSuccess(input) {
      await utils.recipe.getRecipes.invalidate();
      await utils.recipe.getRecipeBySlug.invalidate({ slug: input.slug });
    },
  });
}

export { useDeleteRecipeBySlug };
