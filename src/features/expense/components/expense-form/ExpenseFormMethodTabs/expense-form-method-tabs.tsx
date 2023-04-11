import { Tabs } from "@mantine/core";
import { useFormContext } from "react-hook-form";

import { EqualTab } from "./equal-tab";
import { RatioTab } from "./ratio-tab";
import { SingleTab } from "./single-tab";
import { UnequalTab } from "./unequal-tab";

import type { GetGroupById } from "utils/api";

interface ExpenseFormMethodTabsProps {
  group: GetGroupById;
}

export function ExpenseFormMethodTabs({ group }: ExpenseFormMethodTabsProps) {
  const { setValue } = useFormContext();

  return (
    <Tabs
      mt={16}
      defaultValue="single"
      onTabChange={(value) => setValue("method", value)}
    >
      <Tabs.List>
        <Tabs.Tab value="single">Pojedynczy</Tabs.Tab>
        <Tabs.Tab value="equal">Równo</Tabs.Tab>
        <Tabs.Tab value="unequal">Nierówno</Tabs.Tab>
        <Tabs.Tab value="ratio">Współczynnik</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="single" mt="md">
        <SingleTab group={group} />
      </Tabs.Panel>

      <Tabs.Panel value="equal" mt="md">
        <EqualTab />
      </Tabs.Panel>

      <Tabs.Panel value="unequal" mt="md">
        <UnequalTab />
      </Tabs.Panel>

      <Tabs.Panel value="ratio" mt="md">
        <RatioTab />
      </Tabs.Panel>
    </Tabs>
  );
}
