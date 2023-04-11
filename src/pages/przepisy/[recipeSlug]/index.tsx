import { Box, Divider, List, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";

import { RecipeEditButtons, useRecipeBySlug } from "features/recipe";
import { correctUnit } from "lib/unitsMap";

function RecipePage() {
  const router = useRouter();
  const { recipeSlug } = router.query;
  const { data: recipe } = useRecipeBySlug({ slug: recipeSlug as string });

  if (!recipe) return null;

  return (
    <Stack>
      <Title order={1}>{recipe.name}</Title>
      <Title order={2}>Składniki</Title>
      <List>
        {recipe.ingredients.map((ingredient) => (
          <List.Item key={ingredient.id}>
            <Box>
              <Text>{`${ingredient.name} - ${ingredient.amount} ${correctUnit(
                ingredient.unit,
                ingredient.amount
              )}`}</Text>
            </Box>
          </List.Item>
        ))}
      </List>
      <Title order={2}>Kroki</Title>
      <List>
        {recipe.steps.map((step) => (
          <List.Item key={step.id}>{step.name}</List.Item>
        ))}
      </List>
      <Divider label={recipe.author.name} labelPosition="center" />
      <RecipeEditButtons />
    </Stack>
  );
}

export default RecipePage;
