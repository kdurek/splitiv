import { Card, Stack, Text } from "@mantine/core";
import Link from "next/link";

import { useRecipes } from "../api/use-recipes";

interface RecipeListProps {
  search: string;
}

export function RecipeList({ search }: RecipeListProps) {
  const { data: recipes } = useRecipes();

  if (!recipes) return null;

  return (
    <Stack>
      {recipes
        .filter((recipe) =>
          recipe.name.toLowerCase().includes(search.toLowerCase())
        )
        .map((recipe) => (
          <Card
            key={recipe.id}
            component={Link}
            href={`/przepisy/${recipe.slug}`}
            withBorder
          >
            <Text weight={500}>{recipe.name}</Text>
          </Card>
        ))}
    </Stack>
  );
}
