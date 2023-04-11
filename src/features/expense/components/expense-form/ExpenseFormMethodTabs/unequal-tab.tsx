import { Box, Group, NumberInput, Stack, Text } from "@mantine/core";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import type { ExpenseFormValues } from "../expense-form.schema";

export function UnequalTab() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<ExpenseFormValues>();
  const amountWatch = watch("amount");
  const unequalWatch = watch("unequal");
  const usedAmount = unequalWatch.reduce(
    (prev, curr) => prev + (curr.amount || 0),
    0
  );
  const remainingAmount = amountWatch - usedAmount || 0;

  const { fields } = useFieldArray({
    control,
    name: "unequal",
    keyName: "fieldId",
  });

  return (
    <Stack>
      <Box>
        <Text>Podział na dokładne kwoty</Text>
        {errors.unequal && (
          <Text size="xs" color="red">
            {errors.unequal?.message}
          </Text>
        )}
      </Box>
      {fields.map((fieldV, index) => (
        <Group key={fieldV.id} grow position="apart">
          <Text w="full">{fieldV.name}</Text>
          <Controller
            name={`unequal.${index}.amount`}
            control={control}
            render={({ field }) => (
              <NumberInput
                {...field}
                decimalSeparator=","
                defaultValue={0}
                min={0}
                precision={2}
                step={0.01}
              />
            )}
          />
        </Group>
      ))}
      <Stack spacing={4} align="end">
        <Text size={26} weight={700}>{`${usedAmount.toFixed(2)} zł`}</Text>
        <Text weight={700}>{`${remainingAmount.toFixed(
          2
        )} zł do podziału`}</Text>
      </Stack>
    </Stack>
  );
}
