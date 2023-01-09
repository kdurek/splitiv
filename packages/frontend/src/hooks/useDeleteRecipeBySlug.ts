import { trpc } from "utils/trpc";

function useDeleteRecipeBySlug() {
  const utils = trpc.useContext();

  return trpc.recipe.deleteRecipeBySlug.useMutation({
    onSuccess(input) {
      utils.recipe.getRecipes.invalidate();
      utils.recipe.getRecipeBySlug.invalidate({ slug: input.slug });
    },
  });
}

export { useDeleteRecipeBySlug };
