import {
  Box,
  Divider,
  HStack,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import React from "react";

function ExpenseCard({ groupId, expense }) {
  // const { mutate: deleteExpense } = useDeleteExpense({ groupId });

  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <HStack justify="space-between">
        <Box>
          <Text fontWeight="bold">{expense.name}</Text>
          <Text fontSize="sm">{expense.amount} zł</Text>
        </Box>
        {/* <ConfirmDialog */}
        {/*  title="Usuń wydatek" */}
        {/*  variant="ghost" */}
        {/*  colorScheme="red" */}
        {/*  onClick={() => deleteExpense(expense.id)} */}
        {/* > */}
        {/*  Usuń */}
        {/* </ConfirmDialog> */}
      </HStack>
      <Divider my={2} />
      <Stack divider={<StackDivider />}>
        {expense.users.map((user) => (
          <Box key={user.id}>
            {user.paid > 0 && user.owed <= 0 && (
              <Text>{`${user.user.name} zapłacił/a ${user.paid} zł`}</Text>
              // <HStack>
              //   <Text>{user.user.name} zapłacił/a</Text>
              //   <Badge colorScheme="green">{`${user.paid} zł`}</Badge>
              // </HStack>
            )}
            {user.owed > 0 && user.paid <= 0 && (
              <Text>{`${user.user.name} pożyczył/a ${user.owed} zł`}</Text>
              // <HStack>
              //   <Text>{user.user.name} pożyczył/a</Text>
              //   <Badge colorScheme="red">{`${user.owed} zł`}</Badge>
              // </HStack>
            )}
            {user.owed > 0 && user.paid > 0 && (
              <Text>
                {`${user.user.name} zapłacił/a ${user.paid} zł i pożyczył/a ${user.owed} zł`}
              </Text>
              // <HStack>
              //   <Text>{user.user.name} zapłacił/a</Text>
              //   <Badge colorScheme="green">{`${user.paid} zł`}</Badge>
              //   <Text>i pożyczył/a</Text>
              //   <Badge colorScheme="red">{`${user.owed} zł`}</Badge>
              // </HStack>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default ExpenseCard;
