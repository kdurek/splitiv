import {
  AccordionButton,
  AccordionItem,
  Box,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { IconCash } from "@tabler/icons";

import { Expense, User } from "../../../types";

interface PaymentCardProps {
  expense: Expense;
  members: User[];
}

function PaymentCard({ expense, members }: PaymentCardProps) {
  const { amount, from, to } = expense.repayments[0];
  const getUserNickname = (userId: number) =>
    members.find((user) => user.id === userId)?.givenName;
  const paymentFromUser = getUserNickname(from);
  const paymentToUser = getUserNickname(to);

  return (
    <AccordionItem>
      <AccordionButton px={2}>
        <Box flex="1" textAlign="left">
          <HStack spacing={2}>
            <Icon as={IconCash} boxSize={8} />
            <Text fontSize="md" fontWeight="light" noOfLines={1}>
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
