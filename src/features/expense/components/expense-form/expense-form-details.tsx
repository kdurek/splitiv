import {
  NativeSelect,
  NumberInput,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";

import type { ExpenseFormValues } from "./expense-form.schema";
import type { GetGroupById } from "utils/api";

interface ExpenseFormDetailsProps {
  group: GetGroupById;
}

export function ExpenseFormDetails({ group }: ExpenseFormDetailsProps) {
  const methods = useFormContext<ExpenseFormValues>();

  const {
    control,
    register,
    formState: { errors },
  } = methods;

  return (
    <Stack>
      <TextInput
        {...register("name")}
        label="Nazwa"
        placeholder="Wprowadź nazwę"
        error={errors.name?.message}
      />
      <Textarea
        {...register("description")}
        label="Opis"
        placeholder="Wprowadź opis (opcjonalne)"
        error={errors.description?.message}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            decimalSeparator=","
            label="Kwota"
            min={0}
            precision={2}
            step={0.01}
            error={errors.amount?.message}
          />
        )}
      />
      <NativeSelect
        {...register("payer")}
        label="Zapłacone przez"
        error={errors.payer?.message}
        data={group.members.map((user) => {
          return { value: user.id, label: user.name ?? "Brak nazwy" };
        })}
      />
    </Stack>
  );
}
