import { Box, NativeSelect, Stack, Text } from "@mantine/core";
import { useFormContext } from "react-hook-form";

import type { ExpenseFormValues } from "../expense-form.schema";
import type { GetGroupById } from "utils/api";

interface SingleTabProps {
  group: GetGroupById;
}

export function SingleTab({ group }: SingleTabProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ExpenseFormValues>();

  if (!group) return null;

  return (
    <Stack>
      <Box>
        <Text>Wydatek dla jednej osoby</Text>
        {errors.single && (
          <Text size="xs" color="red">
            {errors.single?.message}
          </Text>
        )}
      </Box>
      <NativeSelect
        {...register("single.ower")}
        label="Pożyczone przez"
        error={errors.single?.ower?.message}
        data={group.members.map((user) => {
          return { value: user.id, label: user.name ?? "Brak nazwy" };
        })}
      />
    </Stack>
  );
}
