import {
  Button,
  Group,
  NativeSelect,
  NumberInput,
  Paper,
  TextInput,
} from "@mantine/core";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { useCreateExpense } from "hooks/useCreateExpense";
import { GetGroupById } from "utils/trpc";

interface CreatePaymentFormValues {
  name: string;
  amount: number;
  payer: string;
  ower: string;
}

interface CreatePaymentFormProps {
  group: GetGroupById;
  afterSubmit?: () => void;
}

function CreatePaymentForm({ group, afterSubmit }: CreatePaymentFormProps) {
  const { control, handleSubmit, register, reset, getValues, setValue } =
    useForm<CreatePaymentFormValues>({
      defaultValues: { name: "Płatność" },
    });

  const { mutate: createExpense } = useCreateExpense();

  useEffect(() => {
    const firstDebtFound = group?.debts?.[0];
    if (firstDebtFound) {
      setValue("ower", firstDebtFound.fromId);
      setValue("payer", firstDebtFound.toId);
      setValue("amount", parseFloat(firstDebtFound.amount));
    }
  }, [group?.debts, setValue]);

  if (!group) return null;

  const onSubmit: SubmitHandler<CreatePaymentFormValues> = (values) => {
    const { name, payer, ower } = values;
    const amount = values.amount.toFixed(2);
    const type = "payment";
    const users = [
      {
        paid: amount,
        owed: "0.00",
        userId: ower,
      },
      {
        paid: "0.00",
        owed: amount,
        userId: payer,
      },
    ];

    createExpense({ groupId: group.id, name, amount, type, users });
    reset();
    if (afterSubmit) {
      afterSubmit();
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        {...register("name", {
          required: "Pole jest wymagane",
          minLength: {
            value: 3,
            message: "Minimum length should be 3",
          },
        })}
        label="Nazwa"
        placeholder="Wprowadź nazwę"
      />
      <Controller
        name="amount"
        control={control}
        rules={{
          required: "Pole jest wymagane",
        }}
        render={({ field }) => (
          <NumberInput
            {...field}
            mt={16}
            decimalSeparator=","
            label="Kwota"
            defaultValue={0}
            min={0}
            precision={2}
            step={0.01}
          />
        )}
      />
      <NativeSelect
        {...register("ower", {
          required: "Pole jest wymagane",
          validate: (v) => getValues("payer") !== v,
        })}
        mt={16}
        label="Od"
        data={group.members.map((user) => {
          return { value: user.id, label: user.name };
        })}
      />
      <NativeSelect
        {...register("payer", {
          required: "Pole jest wymagane",
          validate: (v) => getValues("ower") !== v,
        })}
        mt={16}
        label="Do"
        data={group.members.map((user) => {
          return { value: user.id, label: user.name };
        })}
      />
      <Group mt={24} position="right">
        <Button variant="default" type="submit">
          Dodaj
        </Button>
      </Group>
    </Paper>
  );
}

export default CreatePaymentForm;
