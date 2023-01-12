import { Card, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";

import { useRecipes } from "hooks/useRecipes";

interface RecipeListProps {
  search: string;
}

function RecipeList({ search }: RecipeListProps) {
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
            to={`/przepisy/${recipe.slug}`}
            withBorder
          >
            <Text weight={500}>{recipe.name}</Text>
          </Card>
        ))}
    </Stack>
  );
}

export default RecipeList;
