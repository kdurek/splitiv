"use client";

import { Space, Text, ThemeIcon } from "@mantine/core";
import { IconReportMoney } from "@tabler/icons-react";

export function ExpenseListLegend() {
  return (
    <div className="border p-4">
      <div className="grid grid-cols-3">
        <div className="text-center">
          <ThemeIcon variant="light" size="xl" color="blue">
            <IconReportMoney />
          </ThemeIcon>
          <Space h="xs" />
          <Text>Nic nie spłacone</Text>
        </div>

        <div className="text-center">
          <ThemeIcon variant="light" size="xl" color="yellow">
            <IconReportMoney />
          </ThemeIcon>
          <Space h="xs" />
          <Text>Częściowo spłacone</Text>
        </div>

        <div className="text-center">
          <ThemeIcon variant="light" size="xl" color="teal">
            <IconReportMoney />
          </ThemeIcon>
          <Space h="xs" />
          <Text>Całość spłacona</Text>
        </div>
      </div>
    </div>
  );
}
