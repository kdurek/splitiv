import {
  Accordion,
  Box,
  Divider,
  Group,
  List,
  Stack,
  Text,
} from "@mantine/core";
import { IconReportMoney } from "@tabler/icons-react";
import dayjs from "dayjs";

import ExpenseCardPayment from "./ExpenseCardPayment";

import type { GetExpensesByGroup, GetGroupById } from "utils/api";

interface ExpenseCardProps {
  group: GetGroupById;
  expense: GetExpensesByGroup[number];
}

function ExpenseCard({ group, expense }: ExpenseCardProps) {
  const payer = expense.debts.find((debt) => expense.payerId === debt.debtorId);
  const debts = expense.debts.filter(
    (debt) => expense.payerId !== debt.debtorId
  );
  const descriptionParts = expense.description?.split("\n");
  const [payerFirstName] = expense.payer.name?.split(" ") ?? "";

  const formattedDate = dayjs(expense.createdAt).format("ddd, D MMMM");

  if (!group) return null;

  return (
    <Accordion.Item value={expense.id}>
      <Accordion.Control p="xs" icon={<IconReportMoney />}>
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
          ).toFixed(2)} zł ${
            payer ? `i oddane ${Number(payer.amount).toFixed(2)} zł` : ""
          }`}</Text>
          <List center spacing={16}>
            {debts.map((debt) => (
              <ExpenseCardPayment
                key={debt.id}
                debt={debt}
                groupId={group.id}
              />
            ))}
          </List>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default ExpenseCard;
