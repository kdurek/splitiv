import { Accordion, Group, List, Stack, Text } from "@mantine/core";
import { IconReportMoney } from "@tabler/icons-react";

import { GetExpensesByGroup, GetGroupById } from "utils/trpc";

import ExpenseCardPayment from "./ExpenseCardPayment";

interface ExpenseCardProps {
  group: GetGroupById;
  expense: GetExpensesByGroup[number];
}

function ExpenseCard({ group, expense }: ExpenseCardProps) {
  const payer = expense.debts.find((debt) => expense.payerId === debt.debtorId);
  const debts = expense.debts.filter(
    (debt) => expense.payerId !== debt.debtorId
  );

  if (!group) return null;

  return (
    <Accordion.Item value={expense.id}>
      <Accordion.Control
        sx={{ alignItems: "start" }}
        icon={<IconReportMoney />}
      >
        <Group align="start">
          <Text sx={{ flex: 1 }} weight={700}>
            {expense.name}
          </Text>
          <Text weight={700}>{expense.amount} zł</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Text>{`${expense.payer.givenName} - zapłacone ${expense.amount} zł ${
            payer ? `i oddane ${payer.amount} zł` : ""
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
