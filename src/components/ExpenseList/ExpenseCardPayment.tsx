import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  NumberInput,
  Paper,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSquare, IconSquareCheck, IconSquareX } from "@tabler/icons-react";
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
  const [isEditing, { toggle: toggleIsEditing, close: closeIsEditing }] =
    useDisclosure(false);
  const [
    isPartialPay,
    { toggle: toggleIsPartialPay, close: closeIsPartialPay },
  ] = useDisclosure(false);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
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
  const watchAmount = watch("amount");

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

  const handlePayPartially = (values: ExpenseCardPaymentFormValues) => {
    updateExpenseDebt(
      {
        expenseDebtId: debt.id,
        settled: values.amount + Number(debt.settled),
      },
      {
        onSuccess() {
          closeIsEditing();
          closeIsPartialPay();
          reset();
        },
        onError(v) {
          setError("amount", { message: v.message });
        },
      }
    );
  };

  const handlePayFully = () => {
    updateExpenseDebt(
      {
        expenseDebtId: debt.id,
        settled: Number(debt.amount),
      },
      {
        onSuccess() {
          closeIsEditing();
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
    <Paper p="xs" withBorder>
      <Group spacing="xs">
        <ActionIcon
          color={getSettledStateColor()}
          onClick={() =>
            !isFullySettled && !notHavePermission && toggleIsEditing()
          }
        >
          {isEditing ? <IconSquareX /> : statusIcon}
        </ActionIcon>
        <Text>
          {isFullySettled
            ? `${debtorFirstName} - ${Number(debt.amount).toFixed(2)} zł oddane`
            : `${debtorFirstName} - ${maximumAmount.toFixed(2)} zł do oddania`}
        </Text>
      </Group>

      <Collapse in={isEditing}>
        <Divider mt="xs" />
        <Text pt="md" align="center">
          Jaką kwotę chcesz oddać?
        </Text>
        <Group mt="xs" position="center">
          <Button color="blue" onClick={toggleIsPartialPay}>
            Część
          </Button>
          <Button color="teal" disabled={isPartialPay} onClick={handlePayFully}>
            Całość
          </Button>
        </Group>

        <Collapse in={isPartialPay}>
          <Divider mt="md" />
          <Box
            mx="xl"
            pt="md"
            component="form"
            onSubmit={handleSubmit(handlePayPartially)}
          >
            <Group>
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
                  />
                )}
              />
              <Button
                color="teal"
                loading={isLoadingUpdateExpenseDebt}
                type="submit"
              >
                Oddaj
              </Button>
            </Group>
            <Text align="center" mt="xs">
              Zostanie do oddania {(maximumAmount - watchAmount).toFixed(2)} zł
            </Text>
            {errors.amount && (
              <Text mt={8} size="xs" color="red">
                {errors.amount?.message}
              </Text>
            )}
          </Box>
        </Collapse>
      </Collapse>
    </Paper>
  );
}

export default ExpenseCardPayment;
