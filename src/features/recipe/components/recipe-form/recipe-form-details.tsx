import { Stack, TextInput } from "@mantine/core";
import { useFormContext } from "react-hook-form";

import type { RecipeFormValues } from "./recipe-form.schema";

export function RecipeDetails() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RecipeFormValues>();

  return (
    <Stack>
      <TextInput
        {...register("name")}
        placeholder="Nazwa przepisu..."
        error={errors.name?.message}
      />
    </Stack>
  );
}
