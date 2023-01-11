import { Tabs } from "@mantine/core";
import { useFormContext } from "react-hook-form";

import EqualTab from "./EqualTab";
import RatioTab from "./RatioTab";
import UnequalTab from "./UnequalTab";

function MethodTabsFormPart() {
  const { setValue } = useFormContext();

  return (
    <Tabs
      mt={16}
      defaultValue="equal"
      onTabChange={(value) => setValue("method", value)}
    >
      <Tabs.List>
        <Tabs.Tab value="equal">Równo</Tabs.Tab>
        <Tabs.Tab value="unequal">Nierówno</Tabs.Tab>
        <Tabs.Tab value="ratio">Współczynnik</Tabs.Tab>
      </Tabs.List>

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

export default MethodTabsFormPart;
