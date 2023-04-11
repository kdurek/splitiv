import { api } from "utils/api";

export function useRecipes() {
  return api.recipe.getRecipes.useQuery();
}
