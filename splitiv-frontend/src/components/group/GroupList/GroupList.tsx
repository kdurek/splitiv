import { Card, CardBody, Stack, Text } from "@chakra-ui/react";

import { GetGroupsByMe } from "utils/trpc";

import GroupListItem from "./GroupListItem";

interface GroupListProps {
  groups: GetGroupsByMe;
}

function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardBody textAlign="center">
          <Text fontSize="xl">Nie należysz jeszcze do żadnej grupy</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack>
      {groups.map((group) => (
        <GroupListItem key={group.id} group={group} />
      ))}
    </Stack>
  );
}

export default GroupList;
