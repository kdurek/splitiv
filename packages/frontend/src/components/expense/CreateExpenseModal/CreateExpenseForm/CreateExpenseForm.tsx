import { PLN } from "@dinero.js/currencies";
import {
  Button,
  Group,
  NativeSelect,
  NumberInput,
  Paper,
  TextInput,
} from "@mantine/core";
import { allocate, toDecimal } from "dinero.js";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { useCreateExpense } from "hooks/useCreateExpense";
import { dineroFromString } from "utils/dinero";
import { GetGroupById } from "utils/trpc";

import MethodTabs from "./MethodTabs";

interface CreateExpenseFormValues {
  name: string;
  amount: number;
  payer: string;
  method: string;
  equal: {
    id: string;
    check: boolean;
    paid: string;
    owed: string;
    userId: string;
  }[];
  unequal: {
    id: string;
    paid: string;
    owed: number;
    userId: string;
  }[];
  ratio: {
    id: string;
    paid: string;
    ratio: number;
    userId: string;
  }[];
}

interface CreateExpenseFormProps {
  group: GetGroupById;
  afterSubmit?: () => void;
}

function CreateExpenseForm({ group, afterSubmit }: CreateExpenseFormProps) {
  const { mutate: createExpense } = useCreateExpense();

  const equalDefaults = group?.members.map((member) => ({
    id: member.id,
    name: member.name,
    check: false,
    paid: "0.00",
    owed: "0.00",
    userId: member.id,
  }));

  const unequalDefaults = group?.members.map((member) => ({
    id: member.id,
    name: member.name,
    owed: 0,
  }));

  const ratioDefaults = group?.members.map((member) => ({
    id: member.id,
    name: member.name,
    ratio: 0,
  }));

  const methods = useForm<CreateExpenseFormValues>({
    defaultValues: {
      amount: 0,
      method: "equal",
      equal: equalDefaults,
      unequal: unequalDefaults,
      ratio: ratioDefaults,
    },
  });

  const { control, handleSubmit, register, reset } = methods;

  if (!group) return null;

  const onSubmit: SubmitHandler<CreateExpenseFormValues> = (values) => {
    const { name, payer, method, equal, unequal, ratio } = values;
    const amount = values.amount.toFixed(2);
    const dineroAmount = dineroFromString({
      amount,
      currency: PLN,
      scale: 2,
    });

    if (method === "equal") {
      const filteredUsers = equal.filter(
        (user) => user.check || payer === user.id
      );
      const usersToAllocate = filteredUsers.map((user) => user.check).length;
      const allocated = allocate(
        dineroAmount,
        new Array(usersToAllocate).fill(1)
      );
      const users = filteredUsers.map((user, index) => {
        const isPayer = payer === user.id;

        return {
          paid: isPayer ? amount : "0.00",
          owed: toDecimal(allocated[index]) || "0.00",
          userId: user.id,
        };
      });

      createExpense({ groupId: group.id, name, amount, users });
    }

    if (method === "unequal") {
      const users = unequal
        .filter((user) => user.owed > 0 || payer === user.id)
        .map((user) => {
          const isPayer = payer === user.id;

          return {
            paid: isPayer ? amount : "0.00",
            owed: user.owed.toFixed(2) || "0.00",
            userId: user.id,
          };
        });

      createExpense({ groupId: group.id, name, amount, users });
    }

    if (method === "ratio") {
      const filteredUsers = ratio.filter(
        (user) => user.ratio > 0 || payer === user.id
      );
      const userRatios = filteredUsers.map((user) => user.ratio);
      const allocated = allocate(dineroAmount, userRatios);
      const users = filteredUsers.map((user, index) => {
        const isPayer = payer === user.id;

        return {
          paid: isPayer ? amount : "0.00",
          owed: toDecimal(allocated[index]) || "0.00",
          userId: user.id,
        };
      });

      createExpense({ groupId: group.id, name, amount, users });
    }

    reset();
    if (afterSubmit) {
      afterSubmit();
    }
  };

  return (
    <FormProvider {...methods}>
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
          {...register("payer", {
            required: "Pole jest wymagane",
          })}
          mt={16}
          label="Zapłacone przez"
          data={group.members.map((user) => {
            return { value: user.id, label: user.name };
          })}
        />
        <MethodTabs />
        <Group mt={24} position="right">
          <Button variant="default" type="submit">
            Dodaj
          </Button>
        </Group>
      </Paper>
    </FormProvider>
  );
}

export default CreateExpenseForm;