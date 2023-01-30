import {
  ActionIcon,
  Group,
  NativeSelect,
  NumberInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { unitsList } from "lib/unitsMap";

import AddButton from "./AddButton";
import { RecipeFormValues } from "./RecipeFormSchema";

function RecipeIngredients() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<RecipeFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  return (
    <Stack>
      <Title order={2}>Składniki</Title>
      {fields.map((fieldV, index) => (
        <Stack
          key={fieldV.id}
          spacing={8}
          sx={{ borderLeft: "solid", paddingLeft: 8 }}
        >
          <Group spacing={8}>
            <TextInput
              {...register(`ingredients.${index}.name`)}
              error={errors.ingredients?.[index]?.name?.message}
              placeholder="Nazwa składnika..."
              sx={{ flex: 1 }}
            />
            {fields.length > 1 && (
              <ActionIcon color="red" onClick={() => remove(index)}>
                <IconTrash />
              </ActionIcon>
            )}
          </Group>
          <Group spacing={8}>
            <Controller
              name={`ingredients.${index}.amount`}
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  decimalSeparator=","
                  defaultValue={1}
                  min={1}
                  sx={{ flex: 1 }}
                />
              )}
            />
            <NativeSelect
              {...register(`ingredients.${index}.unit`)}
              data={unitsList.map((unit) => ({
                label: unit.singularNominativ,
                value: unit.singularNominativ,
              }))}
            />
          </Group>
        </Stack>
      ))}
      <AddButton
        onClick={() => append({ name: "", amount: 1, unit: "gram" })}
      />
    </Stack>
  );
}

export default RecipeIngredients;
