import {
  Accordion,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleDotted,
  IconReportMoney,
} from "@tabler/icons-react";

import UpdateExpenseModal from "components/UpdateExpenseModal";
import { useUpdateExpenseDebt } from "hooks/useUpdateExpenseDebt";
import { GetExpensesByGroup, GetGroupById } from "utils/trpc";

interface ExpenseCardProps {
  group: GetGroupById;
  expense: GetExpensesByGroup[number];
}

function ExpenseCard({ group, expense }: ExpenseCardProps) {
  const { mutate: updateExpenseDebt } = useUpdateExpenseDebt();
  const { colorScheme } = useMantineColorScheme();
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
          <Text>{`${expense.payer.givenName} zapłacił/a ${expense.amount} zł ${
            payer ? `i pożyczył/a ${payer.amount} zł` : ""
          }`}</Text>
          <List center spacing={16}>
            {debts.map((debt) => (
              <List.Item
                key={debt.id}
                icon={
                  <ThemeIcon
                    color={debt.settled ? "teal" : "blue"}
                    variant={colorScheme === "light" ? "light" : "filled"}
                    size={24}
                    radius="xl"
                    onClick={() => {
                      updateExpenseDebt({
                        groupId: group.id,
                        expenseDebtId: debt.id,
                        settled: !debt.settled,
                      });
                    }}
                  >
                    {debt.settled ? (
                      <IconCircleCheck size={16} />
                    ) : (
                      <IconCircleDotted size={16} />
                    )}
                  </ThemeIcon>
                }
              >
                {`${debt.debtor.givenName} pożyczył/a ${debt.amount} zł`}
              </List.Item>
            ))}
          </List>
          <UpdateExpenseModal group={group} expense={expense} />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default ExpenseCard;
