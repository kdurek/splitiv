import { trpc } from "utils/trpc";

function useRecipeBySlug(slug: string | undefined) {
  if (!slug) {
    throw new Error("slug not defined");
  }

  return trpc.recipe.getRecipeBySlug.useQuery(
    { slug },
    { enabled: Boolean(slug) }
  );
}

export { useRecipeBySlug };
