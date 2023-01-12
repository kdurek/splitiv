import { Box, Checkbox, Group, Stack, Text } from "@mantine/core";
import { useFieldArray, useFormContext } from "react-hook-form";

import { ExpenseFormValues } from "../ExpenseFormSchema";

function EqualTab() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ExpenseFormValues>();

  const { fields: equalFields } = useFieldArray({
    control,
    name: "equal",
    keyName: "fieldId",
  });

  return (
    <Stack>
      <Box>
        <Text>Podział na równe kwoty</Text>
        {errors.equal && (
          <Text size="xs" color="red">
            {errors.equal?.message}
          </Text>
        )}
      </Box>
      {equalFields.map((equalField, index) => (
        <Group key={equalField.id} grow>
          <Checkbox
            {...register(`equal.${index}.check`)}
            label={equalField.name}
          />
        </Group>
      ))}
    </Stack>
  );
}

export default EqualTab;
