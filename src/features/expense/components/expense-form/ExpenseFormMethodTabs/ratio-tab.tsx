import { Box, Group, NumberInput, Stack, Text } from "@mantine/core";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import type { ExpenseFormValues } from "../expense-form.schema";

export function RatioTab() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ExpenseFormValues>();

  const { fields: ratioFields } = useFieldArray({
    control,
    name: "ratio",
    keyName: "fieldId",
  });

  return (
    <Stack>
      <Box>
        <Text>Podział według współczynnika</Text>
        {errors.ratio && (
          <Text size="xs" color="red">
            {errors.ratio?.message}
          </Text>
        )}
      </Box>
      {ratioFields.map((ratioField, index) => (
        <Group key={ratioField.id} grow position="apart">
          <Text>{ratioField.name}</Text>
          <Controller
            name={`ratio.${index}.ratio`}
            control={control}
            render={({ field }) => (
              <NumberInput
                {...field}
                decimalSeparator=","
                defaultValue={0}
                min={0}
              />
            )}
          />
        </Group>
      ))}
    </Stack>
  );
}
