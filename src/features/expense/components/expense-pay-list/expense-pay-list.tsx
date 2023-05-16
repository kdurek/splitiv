import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSquareArrowUp } from "@tabler/icons-react";
import { useFieldArray, useForm } from "react-hook-form";

import { useSettleExpenseDebts } from "features/expense/api/use-update-expense-debts";
import { useActiveGroup } from "features/group";
import { api } from "utils/api";

import { ExpensePayListSchema } from "./expense-pay-list.schema";

import type { ExpensePayListSchemaValues } from "./expense-pay-list.schema";

interface ExpensePayListFormProps {
  payerId: string;
  debtorId: string;
  closeModal: () => void;
}

function ExpensePayListForm({
  payerId,
  debtorId,
  closeModal,
}: ExpensePayListFormProps) {
  const activeGroup = useActiveGroup();
  const { data: debts } = api.debt.getDebts.useQuery({
    groupId: activeGroup.id,
    payerId,
    debtorId,
    isSettled: false,
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpensePayListSchemaValues>({
    values: {
      debts: debts?.map((debt) => ({
        id: debt.id,
        name: debt.debtor.name ?? "Brak nazwy",
        settled: Number(debt.settled),
        amount: Number(debt.amount),
        check: false,
      })),
    },
    resolver: zodResolver(ExpensePayListSchema),
  });

  const { mutate: settleExpenseDebts, isLoading: isLoadingSettleExpenseDebts } =
    useSettleExpenseDebts();

  const debtsSum = watch("debts")
    ?.reduce(
      (prev, curr) => prev + (curr.check ? curr.amount - curr.settled : 0),
      0
    )
    .toFixed(2);

  const { fields: debtFields } = useFieldArray({
    control,
    name: "debts",
  });

  const handleSettleExpenseDebts = (values: ExpensePayListSchemaValues) => {
    const expenseDebts = values.debts
      ?.filter((debt) => debt.check)
      .map((debt) => {
        return {
          id: debt.id,
          settled: debt.amount,
        };
      });

    if (expenseDebts) {
      settleExpenseDebts(
        {
          expenseDebts,
        },
        {
          onSuccess() {
            reset();
            closeModal();
          },
        }
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleSettleExpenseDebts)}>
      <Stack>
        {debtFields.map((debtField, index) => (
          <Paper key={debtField.id} withBorder p="md">
            <Group>
              <Text sx={{ flex: 1 }} weight={700}>
                {debtField.name}
              </Text>
              <Checkbox
                {...register(`debts.${index}.check`)}
                label={`${(
                  Number(debtField.amount) - Number(debtField.settled)
                ).toFixed(2)} zł`}
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
          <Text weight={700}>{`${debtsSum} zł`}</Text>
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

interface ExpensePayListProps {
  payerId: string;
  debtorId: string;
}

export function ExpensePayList({ payerId, debtorId }: ExpensePayListProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="default" onClick={open}>
        Oddaj długi
      </Button>

      <Modal opened={opened} onClose={close} title="Oddawanie długów">
        <Stack>
          <ExpensePayListForm
            payerId={payerId}
            debtorId={debtorId}
            closeModal={close}
          />
        </Stack>
      </Modal>
    </>
  );
}
