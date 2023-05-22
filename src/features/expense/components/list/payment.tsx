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
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconSquare, IconSquareCheck, IconSquareX } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import z from "zod";

import { useUpdateExpenseDebt } from "features/expense/api/use-update-expense-debt";

import type { GetExpensesByGroup } from "utils/api";

interface ExpenseCardPaymentProps {
  debt: GetExpensesByGroup[number]["debts"][number];
}

const expenseCardPaymentFormSchema = z.object({
  amount: z.number().positive("Kwota musi być większa niż zero"),
});

type ExpenseCardPaymentFormSchema = z.infer<
  typeof expenseCardPaymentFormSchema
>;

export function ExpenseListPayment({ debt }: ExpenseCardPaymentProps) {
  const { data: session } = useSession();

  const { mutate: updateExpenseDebt, isLoading: isLoadingUpdateExpenseDebt } =
    useUpdateExpenseDebt();

  const [isEditing, { toggle: toggleIsEditing, close: closeIsEditing }] =
    useDisclosure(false);

  const [
    isPartialPay,
    { toggle: toggleIsPartialPay, close: closeIsPartialPay },
  ] = useDisclosure(false);

  const form = useForm<ExpenseCardPaymentFormSchema>({
    initialValues: {
      amount: 0,
    },
    validate: zodResolver(expenseCardPaymentFormSchema),
  });

  const [debtorFirstName] = debt.debtor.name?.split(" ") ?? "";

  const notHavePermission =
    session?.user?.id !== debt.debtorId &&
    session?.user?.id !== debt.expense.payerId;

  const watchAmount = form.values.amount;

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

  const handlePayPartially = (values: ExpenseCardPaymentFormSchema) => {
    updateExpenseDebt(
      {
        expenseDebtId: debt.id,
        settled: values.amount + Number(debt.settled),
      },
      {
        onSuccess() {
          closeIsEditing();
          closeIsPartialPay();
          form.reset();
        },
        onError(error) {
          form.setFieldError("amount", error.message);
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
          form.reset();
        },
        onError(error) {
          form.setFieldError("amount", error.message);
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
            onSubmit={form.onSubmit(handlePayPartially)}
          >
            <Group>
              <NumberInput
                decimalSeparator=","
                min={0}
                max={maximumAmount}
                precision={2}
                step={0.01}
                sx={{
                  flex: 1,
                }}
                {...form.getInputProps("amount", {
                  withError: false,
                })}
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
            {form.errors.amount && (
              <Text mt={8} size="xs" align="center" color="red">
                {form.errors.amount}
              </Text>
            )}
          </Box>
        </Collapse>
      </Collapse>
    </Paper>
  );
}
