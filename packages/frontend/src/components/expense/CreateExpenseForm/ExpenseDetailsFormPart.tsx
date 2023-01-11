import { NativeSelect, NumberInput, Stack, TextInput } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";

import { GetGroupById } from "utils/trpc";

import { ExpenseFormValues } from "./ExpenseFormSchema";

interface ExpenseDetailsFormPartProps {
  group: GetGroupById;
}

function ExpenseDetailsFormPart({ group }: ExpenseDetailsFormPartProps) {
  const methods = useFormContext<ExpenseFormValues>();

  const {
    control,
    register,
    formState: { errors },
  } = methods;

  if (!group) return null;

  return (
    <Stack>
      <TextInput
        {...register("name")}
        label="Nazwa"
        placeholder="Wprowadź nazwę"
        error={errors.name?.message}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <NumberInput
            {...field}
            decimalSeparator=","
            label="Kwota"
            defaultValue={0}
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
        data={group.members.map((user) => {
          return { value: user.id, label: user.name };
        })}
      />
    </Stack>
  );
}

export default ExpenseDetailsFormPart;
