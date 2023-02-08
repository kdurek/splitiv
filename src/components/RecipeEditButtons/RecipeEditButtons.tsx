import { Button, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";

import { useCurrentUser } from "hooks/useCurrentUser";
import { useDeleteRecipeBySlug } from "hooks/useDeleteRecipeBySlug";
import { useRecipeBySlug } from "hooks/useRecipeBySlug";

function RecipeEditButtons() {
  const router = useRouter();
  const { recipeSlug } = router.query;
  const { data: recipe } = useRecipeBySlug({ slug: recipeSlug as string });
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
            router.replace("/przepisy");
          }}
        >
          Usuń
        </Button>
        <Button
          variant="default"
          onClick={() => router.replace(`${recipeSlug}/edytuj`)}
        >
          Edytuj
        </Button>
      </Group>
    </Stack>
  );
}

export default RecipeEditButtons;
