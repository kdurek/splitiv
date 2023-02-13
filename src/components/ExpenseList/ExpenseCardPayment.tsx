import { zodResolver } from "@hookform/resolvers/zod";
import { ActionIcon, Box, Group, List, NumberInput, Text } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import {
  IconSquare,
  IconSquareArrowUp,
  IconSquareCheck,
  IconSquareX,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { useUpdateExpenseDebt } from "hooks/useUpdateExpenseDebt";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import type { Decimal } from "@prisma/client/runtime";

interface ExpenseCardPaymentProps {
  debt: {
    id: string;
    settled: Decimal;
    amount: Decimal;
    expense: {
      payerId: string;
    };
    debtor: {
      name: string | null;
    };
    debtorId: string;
  };
}

const schema = z.object({
  amount: z.number().positive("Kwota musi być większa niż 0"),
});

type ExpenseCardPaymentFormValues = z.infer<typeof schema>;

function ExpenseCardPayment({ debt }: ExpenseCardPaymentProps) {
  const { activeGroupId } = useActiveGroup();
  const { mutate: updateExpenseDebt, isLoading: isLoadingUpdateExpenseDebt } =
    useUpdateExpenseDebt({
      groupId: activeGroupId,
    });
  const [isEditing, toggleIsEditing] = useToggle();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ExpenseCardPaymentFormValues>({
    shouldUnregister: true,
    defaultValues: {
      amount: 0,
    },
    resolver: zodResolver(schema),
  });

  const { data: session } = useSession();
  const [debtorFirstName] = debt.debtor.name?.split(" ") ?? "";
  const notHavePermission =
    session?.user?.id !== debt.debtorId &&
    session?.user?.id !== debt.expense.payerId;

  const isFullySettled = debt.settled === debt.amount;
  const isPartiallySettled =
    debt.settled !== debt.amount && Number(debt.settled) !== 0;
  const maximumAmount = Number(debt.amount) - Number(debt.settled);

  const statusIcon = isFullySettled ? <IconSquareCheck /> : <IconSquare />;

  const getSettledStateColor = () => {
    if (isEditing) {
      return "red";
    }

    if (isFullySettled) {
      return "teal";
    }

    if (isPartiallySettled) {
      return "yellow";
    }

    return "blue";
  };

  const onSubmit = (values: ExpenseCardPaymentFormValues) => {
    updateExpenseDebt(
      {
        expenseDebtId: debt.id,
        settled: values.amount + Number(debt.settled),
      },
      {
        onSuccess() {
          toggleIsEditing(false);
          reset();
        },
        onError(v) {
          setError("amount", { message: v.message });
        },
      }
    );
  };

  if (!debt) return null;

  return (
    <>
      <List.Item
        h={36}
        icon={
          <ActionIcon
            color={getSettledStateColor()}
            size={36}
            onClick={() =>
              !isFullySettled && !notHavePermission && toggleIsEditing()
            }
          >
            {isEditing ? <IconSquareX /> : statusIcon}
          </ActionIcon>
        }
      >
        {isEditing ? (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Group>
              <ActionIcon
                color="teal"
                loading={isLoadingUpdateExpenseDebt}
                size={36}
                type="submit"
              >
                <IconSquareCheck />
              </ActionIcon>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    defaultValue={0}
                    decimalSeparator=","
                    min={0}
                    max={maximumAmount}
                    precision={2}
                    step={0.01}
                    sx={{
                      flex: 1,
                    }}
                    rightSection={
                      <ActionIcon
                        mr={12}
                        size={36}
                        color="blue"
                        onClick={() => setValue("amount", maximumAmount)}
                      >
                        <IconSquareArrowUp />
                      </ActionIcon>
                    }
                  />
                )}
              />
            </Group>
          </Box>
        ) : (
          <Text>
            {isFullySettled
              ? `${debtorFirstName} - ${Number(debt.amount).toFixed(
                  2
                )} zł oddane`
              : `${debtorFirstName} - ${maximumAmount.toFixed(
                  2
                )} zł do oddania`}
          </Text>
        )}
      </List.Item>
      {errors.amount && (
        <Text mt={8} size="xs" color="red">
          {errors.amount?.message}
        </Text>
      )}
    </>
  );
}

export default ExpenseCardPayment;
