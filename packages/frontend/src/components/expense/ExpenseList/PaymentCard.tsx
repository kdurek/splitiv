import { Accordion, Divider, Group, List, Stack, Text } from "@mantine/core";
import { IconCash } from "@tabler/icons";

import { GetExpensesByGroup } from "utils/trpc";

import UpdateExpenseModal from "../UpdateExpenseModal";

interface PaymentCardProps {
  expense: GetExpensesByGroup[number];
}

function PaymentCard({ expense }: PaymentCardProps) {
  const { fromId, toId } = expense.repayments[0];
  const getUserNickname = (userId: string) =>
    expense.users.find((user) => user.userId === userId)?.user.givenName;
  const paymentFromUser = getUserNickname(fromId);
  const paymentToUser = getUserNickname(toId);

  return (
    <Accordion.Item value={expense.id}>
      <Accordion.Control sx={{ alignItems: "start" }} icon={<IconCash />}>
        <Group align="start">
          <Text sx={{ flex: 1 }}>{expense.name}</Text>
          <Text>{expense.amount} zł</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Divider />
          <List>
            <List.Item>{`${paymentToUser} zapłacił/a ${paymentFromUser}`}</List.Item>
          </List>
          <UpdateExpenseModal expense={expense} />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default PaymentCard;
