import { Avatar, Box, HStack, Stack, Text } from "@chakra-ui/react";

import { Debt } from "types";
import { GetGroupById, GetUsers } from "utils/trpc";

interface UserDebtsProps {
  member: GetUsers[number];
  members: GetUsers;
  debts: Debt[];
}

function UserDebts({ member, members, debts }: UserDebtsProps) {
  if (!debts) return null;

  const userDebts = debts.filter((debt) => debt.fromId === member.id);
  const userGets = debts.filter((debt) => debt.toId === member.id);
  const getUserNickname = (userId: string) =>
    members.find((user) => user.id === userId)?.name;

  return (
    <Box>
      {userDebts.length > 0 && (
        <Stack spacing={0}>
          {userDebts.map((debt) => (
            <Text key={debt.fromId + debt.toId} color="red.400">
              {`${debt.amount} zł dla ${getUserNickname(debt.toId)}`}
            </Text>
          ))}
        </Stack>
      )}
      {userGets.length > 0 && (
        <Stack spacing={0}>
          {userGets.map((debt) => (
            <Text key={debt.fromId + debt.toId} color="green.400">
              {`${debt.amount} zł od ${getUserNickname(debt.fromId)}`}
            </Text>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function UserBalance({ group }: { group: GetGroupById }) {
  if (!group?.members) return null;

  return (
    <Stack spacing={4}>
      {group.members.map((member) => (
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
          <UserDebts
            member={member}
            members={group.members}
            debts={group.debts}
          />
        </Stack>
      ))}
    </Stack>
  );
}

export default UserBalance;
