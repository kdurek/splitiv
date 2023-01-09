import { trpc } from "utils/trpc";

function useRecipes() {
  return trpc.recipe.getRecipes.useQuery();
}

export { useRecipes };
