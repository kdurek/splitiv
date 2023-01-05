import { Text } from "@mantine/core";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Text component={Link} size="lg" weight={700} to="/" color="gray.6">
      Splitiv
    </Text>
  );
}
