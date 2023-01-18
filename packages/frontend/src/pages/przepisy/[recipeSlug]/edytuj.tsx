import { Button, Stack } from "@mantine/core";
import { useNavigate, useParams } from "react-router";

import UpdateRecipeForm from "components/UpdateRecipeForm/UpdateRecipeForm";
import { useRecipeBySlug } from "hooks/useRecipeBySlug";
import ProtectedRoute from "ProtectedRoute";

function EditRecipePage() {
  const navigate = useNavigate();
  const { recipeSlug } = useParams();
  const { data: recipe } = useRecipeBySlug(recipeSlug);

  if (!recipe) return null;

  return (
    <ProtectedRoute>
      <Stack>
        <UpdateRecipeForm recipe={recipe} />
        <Button
          variant="default"
          onClick={() => navigate(`/przepisy/${recipeSlug}`)}
        >
          Anuluj
        </Button>
      </Stack>
    </ProtectedRoute>
  );
}

export default EditRecipePage;
