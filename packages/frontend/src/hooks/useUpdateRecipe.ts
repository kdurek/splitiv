import { trpc } from "utils/trpc";

function useUpdateRecipe() {
  const utils = trpc.useContext();

  return trpc.recipe.updateRecipe.useMutation({
    onSuccess(input) {
      utils.recipe.getRecipeBySlug.invalidate({ slug: input.slug });
    },
  });
}

export { useUpdateRecipe };
