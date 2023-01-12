import { Accordion, Avatar, Box, Group, Text } from "@mantine/core";

import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";
import { Debt } from "types";
import { GetUsers } from "utils/trpc";

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
      {userDebts.length > 0 &&
        userDebts.map((debt) => (
          <Text key={debt.fromId + debt.toId} weight={500} color="red">
            {`${debt.amount} zł dla ${getUserNickname(debt.toId)}`}
          </Text>
        ))}
      {userGets.length > 0 &&
        userGets.map((debt) => (
          <Text key={debt.fromId + debt.toId} weight={500} color="green">
            {`${debt.amount} zł od ${getUserNickname(debt.fromId)}`}
          </Text>
        ))}
    </Box>
  );
}

function UserBalance() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);

  if (!group) return null;

  return (
    <Accordion variant="contained">
      {group.members.map((member) => (
        <Accordion.Item key={member.id} value={member.id}>
          <Accordion.Control>
            <Group>
              <Avatar src={member.picture} />
              <Box>
                <Text weight={700}>{member.name}</Text>
                <Text weight={500} size="sm">
                  {member.balance} zł
                </Text>
              </Box>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <UserDebts
              member={member}
              members={group.members}
              debts={group.debts}
            />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export default UserBalance;
