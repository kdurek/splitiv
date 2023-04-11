import { Box, Paper, SimpleGrid, Space, Text, ThemeIcon } from "@mantine/core";
import { IconReportMoney } from "@tabler/icons-react";

export function ExpensePaymentLegend() {
  return (
    <Paper withBorder p="md">
      <SimpleGrid cols={3}>
        <Box sx={{ textAlign: "center" }}>
          <ThemeIcon variant="light" size="xl" color="blue">
            <IconReportMoney />
          </ThemeIcon>
          <Space h="xs" />
          <Text>Nic nie spłacone</Text>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <ThemeIcon variant="light" size="xl" color="yellow">
            <IconReportMoney />
          </ThemeIcon>
          <Space h="xs" />
          <Text>Częściowo spłacone</Text>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <ThemeIcon variant="light" size="xl" color="teal">
            <IconReportMoney />
          </ThemeIcon>
          <Space h="xs" />
          <Text>Całość spłacona</Text>
        </Box>
      </SimpleGrid>
    </Paper>
  );
}
