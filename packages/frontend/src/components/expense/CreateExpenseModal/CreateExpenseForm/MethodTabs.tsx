import { Tabs } from "@mantine/core";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import EqualTab from "./EqualTab";
import RatioTab from "./RatioTab";
import UnequalTab from "./UnequalTab";

function MethodTabs() {
  const { watch, setValue } = useFormContext();

  const methodWatch = watch("method");

  useEffect(() => {
    setValue("method", "equal");
  }, [setValue]);

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
        {methodWatch === "equal" && <EqualTab />}
      </Tabs.Panel>

      <Tabs.Panel value="unequal" mt="md">
        {methodWatch === "unequal" && <UnequalTab />}
      </Tabs.Panel>

      <Tabs.Panel value="ratio" mt="md">
        {methodWatch === "ratio" && <RatioTab />}
      </Tabs.Panel>
    </Tabs>
  );
}

export default MethodTabs;
