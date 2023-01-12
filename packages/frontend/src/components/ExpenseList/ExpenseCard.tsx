import { Accordion, Divider, Group, List, Stack, Text } from "@mantine/core";
import { IconReportMoney } from "@tabler/icons";

import UpdateExpenseModal from "components/UpdateExpenseModal";
import { GetExpensesByGroup, GetGroupById } from "utils/trpc";

interface ExpenseCardProps {
  group: GetGroupById;
  expense: GetExpensesByGroup[number];
}

function ExpenseCard({ group, expense }: ExpenseCardProps) {
  const payers = expense.users.filter((user) => parseFloat(user.paid) > 0);
  const owers = expense.users.filter((user) => parseFloat(user.owed) > 0);

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
          <Divider />
          <List>
            {payers.map((user) => (
              <List.Item
                key={user.id}
              >{`${user.user.givenName} zapłacił/a ${user.paid} zł`}</List.Item>
            ))}
          </List>
          <List withPadding>
            {owers.map((user) => (
              <List.Item
                key={user.id}
                pl={16}
              >{`${user.user.givenName} pożyczył/a ${user.owed} zł`}</List.Item>
            ))}
          </List>
          <UpdateExpenseModal group={group} expense={expense} />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default ExpenseCard;
