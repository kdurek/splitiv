import { Text } from "@mantine/core";
import Link from "next/link";

export function Logo() {
  return (
    <Text
      component={Link}
      href="/wydatki"
      size="lg"
      weight={700}
      color="gray.6"
    >
      Splitiv
    </Text>
  );
}
