import { Accordion, Group, Stack, Text } from "@mantine/core";
import { IconReportMoney } from "@tabler/icons";

import UpdateExpenseModal from "components/expense/UpdateExpenseModal";
import { GetExpensesByGroup } from "utils/trpc";

interface ExpenseCardProps {
  expense: GetExpensesByGroup[number];
}

function ExpenseCard({ expense }: ExpenseCardProps) {
  const payers = expense.users.filter((user) => parseFloat(user.paid) > 0);
  const owers = expense.users.filter((user) => parseFloat(user.owed) > 0);

  return (
    <Accordion.Item value={expense.id}>
      <Accordion.Control icon={<IconReportMoney />}>
        <Group position="apart">
          <Text weight="bold">{expense.name}</Text>
          <Text weight="bold">{expense.amount} zł</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Stack>
            {payers.map((user) => (
              <Text
                key={user.id}
              >{`${user.user.givenName} zapłacił/a ${user.paid} zł`}</Text>
            ))}
            {owers.map((user) => (
              <Text
                key={user.id}
                pl={16}
              >{`${user.user.givenName} pożyczył/a ${user.owed} zł`}</Text>
            ))}
          </Stack>
          <UpdateExpenseModal expense={expense} />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default ExpenseCard;
