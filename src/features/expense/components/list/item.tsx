import {
  Box,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconReportMoney } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

import { DeleteExpenseModal } from "../delete-expense-modal";

import { ExpenseListPayment } from "./payment";

import type { GetExpensesByGroup } from "utils/api";

interface ExpenseCardProps {
  expense: GetExpensesByGroup[number];
}

export function ExpenseListItem({ expense }: ExpenseCardProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: session } = useSession();
  const descriptionParts = expense.description?.split("\n");
  const hasDescription = descriptionParts?.length;
  const [payerFirstName] = expense.payer.name?.split(" ") ?? "";
  const formattedDate = dayjs(expense.createdAt).format("ddd, D MMMM");

  const getSettledStateIcon = () => {
    const isPartiallySettled = expense.debts
      .filter((debt) => debt.debtorId !== expense.payerId)
      .some(
        (debt) =>
          (debt.settled !== debt.amount && Number(debt.settled) !== 0) ||
          debt.settled === debt.amount
      );
    const isFullySettled = expense.debts.every(
      (debt) => debt.settled === debt.amount
    );

    if (isFullySettled) {
      return (
        <ThemeIcon variant="light" size="xl" color="teal">
          <IconReportMoney />
        </ThemeIcon>
      );
    }

    if (isPartiallySettled) {
      return (
        <ThemeIcon variant="light" size="xl" color="yellow">
          <IconReportMoney />
        </ThemeIcon>
      );
    }

    return (
      <ThemeIcon variant="light" size="xl" color="blue">
        <IconReportMoney />
      </ThemeIcon>
    );
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title={expense.name}>
        {hasDescription && (
          <Box>
            {descriptionParts?.map((part, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Text key={part + index}>{part}</Text>
            ))}
          </Box>
        )}
        <Divider mb="md" mt={hasDescription ? "md" : undefined} />
        <Text>{`${payerFirstName} - zapłacone ${Number(expense.amount).toFixed(
          2
        )} zł`}</Text>
        <Stack mt="md">
          {expense.debts.map((debt) => (
            <ExpenseListPayment key={debt.id} debt={debt} />
          ))}
        </Stack>
        {session?.user.id === expense.payerId && (
          <>
            <Divider my="md" />
            <Box sx={{ textAlign: "end" }}>
              <DeleteExpenseModal expenseId={expense.id} />
            </Box>
          </>
        )}
      </Modal>

      <UnstyledButton onClick={open}>
        <Paper p="sm" withBorder>
          <Group position="apart">
            <Group>
              {getSettledStateIcon()}
              <Box>
                <Text lineClamp={1}>{expense.name}</Text>
                <Text size="sm" color="dimmed">
                  {formattedDate}
                </Text>
              </Box>
            </Group>
            <Text size="sm" color="dimmed">
              {Number(expense.amount).toFixed(2)} zł
            </Text>
          </Group>
        </Paper>
      </UnstyledButton>
    </>
  );
}
