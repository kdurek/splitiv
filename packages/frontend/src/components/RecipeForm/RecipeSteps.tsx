import { ActionIcon, Box, Group, Stack, Textarea, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import { useFieldArray, useFormContext } from "react-hook-form";

import AddButton from "./AddButton";
import { RecipeFormValues } from "./RecipeFormSchema";

function RecipeSteps() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<RecipeFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  return (
    <Stack>
      <Title order={2}>Kroki</Title>
      {fields.map((fieldV, index) => (
        <Box
          key={fieldV.id}
          sx={{
            borderLeft: "solid",
            paddingLeft: 8,
          }}
        >
          <Group spacing={8}>
            <Textarea
              {...register(`steps.${index}.name`)}
              error={errors.steps?.[index]?.name?.message}
              autosize
              minRows={1}
              placeholder="Opis kroku..."
              sx={{ flex: 1 }}
            />
            {fields.length > 1 && (
              <ActionIcon color="red" onClick={() => remove(index)}>
                <IconTrash />
              </ActionIcon>
            )}
          </Group>
        </Box>
      ))}
      <AddButton onClick={() => append({ name: "" })} />
    </Stack>
  );
}

export default RecipeSteps;
