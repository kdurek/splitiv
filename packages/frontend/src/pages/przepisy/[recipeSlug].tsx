import {
  Box,
  Button,
  Divider,
  Group,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import UpdateRecipeForm from "components/recipe/form/UpdateRecipeForm";
import { correctUnit } from "components/recipe/unitsMap";
import { useCurrentUser } from "hooks/useCurrentUser";
import { useDeleteRecipeBySlug } from "hooks/useDeleteRecipeBySlug";
import { useRecipeBySlug } from "hooks/useRecipeBySlug";

function Recipe() {
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const { recipeSlug } = useParams();
  const { data: recipe } = useRecipeBySlug(recipeSlug);
  const { data: user } = useCurrentUser();
  const { mutate: deleteRecipeBySlug } = useDeleteRecipeBySlug();

  if (!recipe || !user) return null;

  if (editMode) {
    return (
      <Stack>
        <UpdateRecipeForm
          recipe={recipe}
          afterSubmit={() => setEditMode(false)}
        />
        <Button variant="default" onClick={() => setEditMode(false)}>
          Anuluj
        </Button>
      </Stack>
    );
  }

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
      {recipe.authorId === user.id && (
        <Stack>
          <Text maw={300} mx="auto" align="center">
            Możesz zarządzać tym przepisem, ponieważ jesteś jego autorem
          </Text>
          <Group grow>
            <Button
              variant="default"
              color="red"
              onClick={() => {
                deleteRecipeBySlug({ slug: recipe.slug });
                navigate("/przepisy", { replace: true });
              }}
            >
              Usuń
            </Button>
            <Button variant="default" onClick={() => setEditMode(true)}>
              Edytuj
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
}

export default Recipe;
