import { Box, Divider, List, Stack, Text, Title } from "@mantine/core";
import { useParams } from "react-router";

import RecipeEditButtons from "components/RecipeEditButtons";
import { useRecipeBySlug } from "hooks/useRecipeBySlug";
import { correctUnit } from "lib/unitsMap";

function RecipePage() {
  const { recipeSlug } = useParams();
  const { data: recipe } = useRecipeBySlug(recipeSlug);

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
      <Divider
        label={`${recipe.author.givenName} ${recipe.author.familyName}`}
        labelPosition="center"
      />
      <RecipeEditButtons />
    </Stack>
  );
}

export default RecipePage;
