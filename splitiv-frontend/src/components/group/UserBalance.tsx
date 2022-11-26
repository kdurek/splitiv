import { Avatar, Box, HStack, Stack, Text } from "@chakra-ui/react";

import { Debt, User } from "../../types";

interface UserDebtsProps {
  member: User;
  members: User[];
  debts: Debt[];
}

function UserDebts({ member, members, debts }: UserDebtsProps) {
  if (!debts) return null;

  const userDebts = debts.filter((debt) => debt.from === member.id);
  const userGets = debts.filter((debt) => debt.to === member.id);
  const getUserNickname = (userId: number) =>
    members.find((user) => user.id === userId)?.name;

  return (
    <Box>
      {userDebts.length > 0 && (
        <Stack spacing={0}>
          {userDebts.map((debt) => (
            <Text key={debt.from + debt.to} color="red.400">
              {`${debt.amount} zł dla ${getUserNickname(debt.to)}`}
            </Text>
          ))}
        </Stack>
      )}
      {userGets.length > 0 && (
        <Stack spacing={0}>
          {userGets.map((debt) => (
            <Text key={debt.from + debt.to} color="green.400">
              {`${debt.amount} zł od ${getUserNickname(debt.from)}`}
            </Text>
          ))}
        </Stack>
      )}
    </Box>
  );
}

interface UserBalanceProps {
  members: User[];
  debts: Debt[];
}

function UserBalance({ members, debts }: UserBalanceProps) {
  if (!members) return null;

  return (
    <Stack spacing={4}>
      {members.map((member) => (
        <Stack
          key={member.id}
          justifyContent="space-between"
          spacing={4}
          direction={["column", "row"]}
        >
          <HStack>
            <Avatar src={member.picture} />
            <Box ml="3">
              <Text fontWeight="bold">{member.name}</Text>
              <Text fontSize="sm">{member.balance} zł</Text>
            </Box>
          </HStack>
          <UserDebts member={member} members={members} debts={debts} />
        </Stack>
      ))}
    </Stack>
  );
}

export default UserBalance;
