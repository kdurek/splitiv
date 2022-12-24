import {
  AccordionButton,
  AccordionItem,
  Box,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { IconCash } from "@tabler/icons";

import { GetExpensesByGroup, GetUsers } from "utils/trpc";

interface PaymentCardProps {
  expense: GetExpensesByGroup[number];
  members: GetUsers;
}

function PaymentCard({ expense, members }: PaymentCardProps) {
  const { amount, fromId, toId } = expense.repayments[0];
  const getUserNickname = (userId: string) =>
    members.find((user) => user.id === userId)?.givenName;
  const paymentFromUser = getUserNickname(fromId);
  const paymentToUser = getUserNickname(toId);

  return (
    <AccordionItem>
      <AccordionButton px={2}>
        <Box flex="1" textAlign="left">
          <HStack spacing={2}>
            <Icon as={IconCash} boxSize={8} />
            <Text fontSize="md" fontWeight="light">
              {`${paymentToUser} zapłacił/a ${paymentFromUser}`}
            </Text>
          </HStack>
        </Box>
        <Text ml={2} fontWeight="light">{`${amount} zł`}</Text>
      </AccordionButton>
    </AccordionItem>
  );
}

export default PaymentCard;
