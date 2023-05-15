import { Box, Stack, Title } from "@mantine/core";

import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <Stack>
      <Title order={1}>{title}</Title>
      <Box>{children}</Box>
    </Stack>
  );
}
