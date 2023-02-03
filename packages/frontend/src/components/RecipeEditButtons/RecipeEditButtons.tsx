import { Button, Group, Stack, Text } from "@mantine/core";
import { useNavigate, useParams } from "react-router";

import { useCurrentUser } from "hooks/useCurrentUser";
import { useDeleteRecipeBySlug } from "hooks/useDeleteRecipeBySlug";
import { useRecipeBySlug } from "hooks/useRecipeBySlug";

function RecipeEditButtons() {
  const navigate = useNavigate();
  const { recipeSlug } = useParams();
  const { data: recipe } = useRecipeBySlug(recipeSlug);
  const { data: user } = useCurrentUser();
  const { mutate: deleteRecipeBySlug } = useDeleteRecipeBySlug();

  if (!recipe || !user) return null;

  if (recipe.authorId !== user.id) return null;

  return (
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
        <Button variant="default" onClick={() => navigate("edytuj")}>
          Edytuj
        </Button>
      </Group>
    </Stack>
  );
}

export default RecipeEditButtons;
