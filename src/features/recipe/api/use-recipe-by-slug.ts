import { api } from "utils/api";

interface UseRecipeBySlugProps {
  slug: string;
}

export function useRecipeBySlug({ slug }: UseRecipeBySlugProps) {
  return api.recipe.getRecipeBySlug.useQuery(
    { slug },
    { enabled: Boolean(slug) }
  );
}