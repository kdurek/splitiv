import {
  Accordion,
  Avatar,
  Box,
  Divider,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useSession } from "next-auth/react";

import { useActiveGroup } from "features/group";

import { DebtDetails } from "../debt-details";
import { ExpensePayListModal } from "../expense-pay-list";

import type { GetUsers } from "utils/api";

interface Debt {
  fromId: string;
  toId: string;
  amount: string;
}

interface UserDebtsProps {
  member: GetUsers[number];
  members: GetUsers;
  debts: Debt[];
}

function UserDebts({ member, members, debts }: UserDebtsProps) {
  const { data: session } = useSession();

  const userDebts = debts.filter((debt) => debt.fromId === member.id);
  const userGets = debts.filter((debt) => debt.toId === member.id);
  const getUserFirstName = (userId: string) =>
    members.find((user) => user.id === userId)?.name?.split(" ")[0];

  if (!session) {
    return null;
  }

  return (
    <Stack>
      {userGets.length > 0 && (
        <Stack>
          <Box>
            {userGets.map((debt) => (
              <Text key={debt.fromId + debt.toId} weight={500} color="green">
                {`${debt.amount} zł od ${getUserFirstName(debt.fromId)}`}
              </Text>
            ))}
          </Box>
          <DebtDetails type="payer" id={member.id} />
          {userGets.some((debt) => debt.fromId === session?.user.id) && (
            <ExpensePayListModal
              payerId={member.id}
              debtorId={session?.user.id}
            />
          )}
        </Stack>
      )}

      {userGets.length > 0 && userDebts.length > 0 && <Divider />}

      {userDebts.length > 0 && (
        <Stack>
          <Box>
            {userDebts.map((debt) => (
              <Text key={debt.fromId + debt.toId} weight={500} color="red">
                {`${debt.amount} zł dla ${getUserFirstName(debt.toId)}`}
              </Text>
            ))}
          </Box>
          <DebtDetails type="debtor" id={member.id} />
        </Stack>
      )}
    </Stack>
  );
}

export function UserBalance() {
  const activeGroup = useActiveGroup();

  return (
    <Accordion variant="contained">
      {activeGroup.members.map((member) => (
        <Accordion.Item key={member.id} value={member.id}>
          <Accordion.Control>
            <Group>
              <Avatar src={member.image} />
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
              members={activeGroup.members}
              debts={activeGroup.debts}
            />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
