import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { arrayOf } from "prop-types";

import { debtType, userType } from "../../types";

function UserDebts({ member, members, debts }) {
  if (!debts) return null;

  const userDebts = debts.filter((debt) => debt.from === member.id);
  const userGets = debts.filter((debt) => debt.to === member.id);
  const getUserNickname = (userId) =>
    members.find((user) => user.id === userId).name;

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

UserDebts.propTypes = {
  members: arrayOf(userType),
  debts: arrayOf(debtType),
  member: userType.isRequired,
};

UserDebts.defaultProps = {
  members: [],
  debts: [],
};

function UserBalance({ members, debts }) {
  if (!members) return null;

  return members.map((member) => (
    <Stack
      key={member.id}
      py={2}
      justifyContent="space-between"
      spacing={[2, 4]}
      direction={["column", "row"]}
    >
      <Flex>
        <Avatar src={member.picture} />
        <Box ml="3">
          <Text fontWeight="bold">{member.name}</Text>
          <Text fontSize="sm">{member.balance} zł</Text>
        </Box>
      </Flex>
      <UserDebts member={member} members={members} debts={debts} />
    </Stack>
  ));
}

UserBalance.propTypes = {
  members: arrayOf(userType),
  debts: arrayOf(debtType),
};

UserBalance.defaultProps = {
  members: [],
  debts: [],
};

export default UserBalance;
