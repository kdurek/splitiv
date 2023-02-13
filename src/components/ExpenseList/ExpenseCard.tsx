import {
  Accordion,
  Box,
  Divider,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconReportMoney } from "@tabler/icons-react";
import dayjs from "dayjs";

import ExpenseCardPayment from "./ExpenseCardPayment";

import type { GetExpensesByGroup } from "utils/api";

interface ExpenseCardProps {
  expense: GetExpensesByGroup[number];
}

function ExpenseCard({ expense }: ExpenseCardProps) {
  const descriptionParts = expense.description?.split("\n");
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
    <Accordion.Item value={expense.id}>
      <Accordion.Control p="xs" icon={getSettledStateIcon()}>
        <Group>
          <Box sx={{ flex: 1 }}>
            <Text>{expense.name}</Text>
            <Text size="sm" color="dimmed">
              {formattedDate}
            </Text>
          </Box>
          <Text>{Number(expense.amount).toFixed(2)} zł</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack>
          {descriptionParts?.length && (
            <>
              <Box>
                {descriptionParts?.map((part, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Text key={part + index}>{part}</Text>
                ))}
              </Box>
              <Divider />
            </>
          )}
          <Text>{`${payerFirstName} - zapłacone ${Number(
            expense.amount
          ).toFixed(2)} zł`}</Text>
          <List center spacing={16}>
            {expense.debts.map((debt) => (
              <ExpenseCardPayment key={debt.id} debt={debt} />
            ))}
          </List>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default ExpenseCard;
