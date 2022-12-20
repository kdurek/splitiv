import {
  Card,
  CardBody,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { GetGroupsByMe } from "utils/trpc";

interface GroupListProps {
  group: GetGroupsByMe[number];
}

function GroupListItem({ group }: GroupListProps) {
  if (!group) {
    return <Skeleton />;
  }

  return (
    <LinkBox>
      <Card>
        <CardBody>
          <Text fontSize="xl">
            <LinkOverlay as={RouterLink} to={`/groups/${group.id}`}>
              {group.name}
            </LinkOverlay>
          </Text>
        </CardBody>
      </Card>
    </LinkBox>
  );
}

export default GroupListItem;
