import {
  AccordionButton,
  AccordionItem,
  Box,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { IconCash } from "@tabler/icons";
import { arrayOf } from "prop-types";

import { expenseType, userType } from "../../../types";

function PaymentCard({
  // groupId,
  expense,
  members,
}) {
  // const { mutate: deleteExpense } = useDeleteExpense({ groupId });
  const { amount, from, to } = expense.repayments[0];
  const getUserNickname = (userId) =>
    members.find((user) => user.id === userId).givenName;
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

            {/* <ConfirmDialog */}
            {/*  title="Usuń płatność" */}
            {/*  variant="ghost" */}
            {/*  colorScheme="red" */}
            {/*  onClick={() => deleteExpense(expense.id)} */}
            {/* > */}
            {/*  Usuń */}
            {/* </ConfirmDialog> */}
          </HStack>
        </Box>
        <Text ml={2} fontWeight="light">{`${amount} zł`}</Text>
      </AccordionButton>
    </AccordionItem>
  );
}

PaymentCard.propTypes = {
  expense: expenseType.isRequired,
  members: arrayOf(userType).isRequired,
};

export default PaymentCard;
