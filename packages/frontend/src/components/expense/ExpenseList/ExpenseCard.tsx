import {
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconReportMoney } from "@tabler/icons";

import UpdateExpenseModal from "components/group/UpdateExpenseModal";
import { GetExpensesByGroup } from "utils/trpc";

interface ExpenseCardProps {
  expense: GetExpensesByGroup[number];
}

function ExpenseCard({ expense }: ExpenseCardProps) {
  const payers = expense.users.filter((user) => parseFloat(user.paid) > 0);
  const owers = expense.users.filter((user) => parseFloat(user.owed) > 0);

  return (
    <AccordionItem>
      <AccordionButton px={2}>
        <Box flex="1" textAlign="left">
          <HStack spacing={2}>
            <Icon as={IconReportMoney} boxSize={8} />
            <Text fontWeight="bold">{expense.name}</Text>
          </HStack>
        </Box>
        <Text ml={2} fontWeight="bold">
          {expense.amount} zł
        </Text>
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Stack gap={2}>
          <Stack>
            {payers.map((user) => (
              <Text
                key={user.id}
              >{`${user.user.givenName} zapłacił/a ${user.paid} zł`}</Text>
            ))}
            {owers.map((user) => (
              <Text
                key={user.id}
                pl={4}
              >{`${user.user.givenName} pożyczył/a ${user.owed} zł`}</Text>
            ))}
          </Stack>
          <UpdateExpenseModal expense={expense} />
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default ExpenseCard;
