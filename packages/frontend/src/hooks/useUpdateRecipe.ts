import { trpc } from "utils/trpc";

function useUpdateRecipe() {
  const utils = trpc.useContext();

  return trpc.recipe.updateRecipe.useMutation({
    async onSuccess(input) {
      await utils.recipe.getRecipeBySlug.invalidate({ slug: input.slug });
    },
  });
}

export { useUpdateRecipe };
