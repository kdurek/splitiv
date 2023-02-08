import { Button, Stack } from "@mantine/core";
import { useRouter } from "next/router";

import UpdateRecipeForm from "components/UpdateRecipeForm/UpdateRecipeForm";
import { useRecipeBySlug } from "hooks/useRecipeBySlug";
import ProtectedRoute from "ProtectedRoute";

function EditRecipePage() {
  const router = useRouter();
  const { recipeSlug } = router.query;
  const { data: recipe } = useRecipeBySlug({ slug: recipeSlug as string });

  if (!recipe) return null;

  return (
    <ProtectedRoute>
      <Stack>
        <UpdateRecipeForm recipe={recipe} />
        <Button
          variant="default"
          onClick={() => router.push(`/przepisy/${recipeSlug}`)}
        >
          Anuluj
        </Button>
      </Stack>
    </ProtectedRoute>
  );
}

export default EditRecipePage;
