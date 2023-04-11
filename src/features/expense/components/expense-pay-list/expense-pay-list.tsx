import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconSquareArrowUp } from "@tabler/icons-react";
import { useFieldArray, useForm } from "react-hook-form";

import { useSettleExpenseDebts } from "features/expense/api/use-update-expense-debts";
import { useActiveGroup } from "features/group";

import { ExpensePayListSchema } from "./expense-pay-list.schema";

import type { ExpensePayListSchemaValues } from "./expense-pay-list.schema";

interface ExpensePayListProps {
  values: ExpensePayListSchemaValues;
  afterSubmit?: () => void;
}

export function ExpensePayList({
  values: debts,
  afterSubmit,
}: ExpensePayListProps) {
  const { activeGroupId } = useActiveGroup();
  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpensePayListSchemaValues>({
    defaultValues: debts,
    resolver: zodResolver(ExpensePayListSchema),
  });

  const { fields: debtFields } = useFieldArray({
    control,
    name: "debts",
  });

  const { mutate: settleExpenseDebts, isLoading: isLoadingSettleExpenseDebts } =
    useSettleExpenseDebts({
      groupId: activeGroupId,
    });

  const debtsSum = watch("debts").reduce(
    (prev, curr) => prev + (curr.check ? curr.amount - curr.settled : 0),
    0
  );

  const onSubmit = (values: ExpensePayListSchemaValues) => {
    const expenseDebts = values.debts
      .filter((debt) => debt.check)
      .map((debt) => {
        return {
          id: debt.id,
          settled: debt.amount,
        };
      });

    settleExpenseDebts(
      {
        expenseDebts,
      },
      {
        onSuccess() {
          reset();
          if (afterSubmit) {
            afterSubmit();
          }
        },
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        {debtFields.map((debtField, index) => (
          <Paper key={debtField.id} withBorder p="md">
            <Group>
              <Text sx={{ flex: 1 }} weight={700}>
                {debtField.name}
              </Text>
              <Checkbox
                {...register(`debts.${index}.check`)}
                label={`${(debtField.amount - debtField.settled).toFixed(
                  2
                )} zł`}
                labelPosition="left"
              />
            </Group>
          </Paper>
        ))}
        {errors.debts && (
          <Text size="xs" color="red">
            {errors.debts?.message}
          </Text>
        )}
        <Group position="apart">
          <Text weight={700}>{`${debtsSum.toFixed(2)} zł`}</Text>
          <Group>
            <ActionIcon
              color="blue"
              onClick={() =>
                debtFields.map((_, index) =>
                  setValue(`debts.${index}.check`, true)
                )
              }
              size={36}
              variant="filled"
            >
              <IconSquareArrowUp />
            </ActionIcon>
            <Button loading={isLoadingSettleExpenseDebts} type="submit">
              Oddaj
            </Button>
          </Group>
        </Group>
      </Stack>
    </Box>
  );
}
