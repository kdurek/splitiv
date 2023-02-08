import { api } from "utils/api";

function useRecipes() {
  return api.recipe.getRecipes.useQuery();
}

export { useRecipes };
