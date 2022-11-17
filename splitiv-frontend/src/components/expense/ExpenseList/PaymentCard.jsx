import {
  Box,
  Divider,
  HStack,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import React from "react";

function PaymentCard({ groupId, expense, members }) {
  // const { mutate: deleteExpense } = useDeleteExpense({ groupId });
  const getUserNickname = (userId) =>
    members.find((user) => user.id === userId).name;

  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <HStack justify="space-between">
        <Box>
          <Text fontWeight="bold">{expense.name}</Text>
          <Text fontSize="sm">{expense.amount} zł</Text>
        </Box>
        {/* <ConfirmDialog */}
        {/*  title="Usuń płatność" */}
        {/*  variant="ghost" */}
        {/*  colorScheme="red" */}
        {/*  onClick={() => deleteExpense(expense.id)} */}
        {/* > */}
        {/*  Usuń */}
        {/* </ConfirmDialog> */}
      </HStack>
      <Divider my={2} />
      <Stack divider={<StackDivider />}>
        {expense.repayments?.map((payment) => (
          <Text key={payment.from + payment.to}>{`${getUserNickname(
            payment.from
          )} przekazał ${getUserNickname(payment.to)} ${
            payment.amount
          } zł`}</Text>
          // <HStack>
          //   <Text>{getUserNickname(payment.from)} przekazał/a</Text>
          //   <Badge colorScheme="green">{`${payment.amount} zł`}</Badge>
          //   <Text>dla {getUserNickname(payment.to)}</Text>
          // </HStack>
        ))}
      </Stack>
    </Box>
  );
}

export default PaymentCard;
