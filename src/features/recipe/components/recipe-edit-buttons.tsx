import { Button, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { useDeleteRecipeBySlug } from "features/recipe/api/use-delete-recipe-by-slug";
import { useRecipeBySlug } from "features/recipe/api/use-recipe-by-slug";

export function RecipeEditButtons() {
  const router = useRouter();
  const { recipeSlug } = router.query;
  const { data: recipe } = useRecipeBySlug({ slug: recipeSlug as string });
  const { data: session } = useSession();
  const { mutate: deleteRecipeBySlug } = useDeleteRecipeBySlug();

  if (!recipe || !session) return null;

  if (recipe.authorId !== session.user.id) return null;

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
