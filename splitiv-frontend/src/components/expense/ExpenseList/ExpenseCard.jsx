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
import React from "react";

function ExpenseCard({ groupId, expense }) {
  // const { mutate: deleteExpense } = useDeleteExpense({ groupId });
  const payers = expense.users.filter((user) => user.paid > 0);
  const owers = expense.users.filter((user) => user.owed > 0);

  return (
    <AccordionItem>
      <AccordionButton px={2}>
        <Box flex="1" textAlign="left">
          <HStack spacing={2}>
            <Icon as={IconReportMoney} boxSize={8} />
            <Text fontWeight="bold" noOfLines={1}>
              {expense.name}
            </Text>

            {/* <ConfirmDialog */}
            {/*  title="Usuń wydatek" */}
            {/*  variant="ghost" */}
            {/*  colorScheme="red" */}
            {/*  onClick={() => deleteExpense(expense.id)} */}
            {/* > */}
            {/*  Usuń */}
            {/* </ConfirmDialog> */}
          </HStack>
        </Box>
        <Text ml={2} fontWeight="bold">
          {expense.amount} zł
        </Text>
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Stack>
          {payers.map((user) => (
            <Text>{`${user.user.givenName} zapłacił/a ${user.paid} zł`}</Text>
          ))}
          {owers.map((user) => (
            <Text
              pl={4}
            >{`${user.user.givenName} pożyczył/a ${user.owed} zł`}</Text>
          ))}
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default ExpenseCard;
