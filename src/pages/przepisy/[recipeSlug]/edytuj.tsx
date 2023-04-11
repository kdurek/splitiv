import { Button, Stack } from "@mantine/core";
import { useRouter } from "next/router";

import { UpdateRecipeForm, useRecipeBySlug } from "features/recipe";
import ProtectedContent from "ProtectedContent";

function EditRecipePage() {
  const router = useRouter();
  const { recipeSlug } = router.query;
  const { data: recipe } = useRecipeBySlug({ slug: recipeSlug as string });

  if (!recipe) return null;

  return (
    <ProtectedContent>
      <Stack>
        <UpdateRecipeForm recipe={recipe} />
        <Button
          variant="default"
          onClick={() => router.push(`/przepisy/${recipeSlug}`)}
        >
          Anuluj
        </Button>
      </Stack>
    </ProtectedContent>
  );
}

export default EditRecipePage;
