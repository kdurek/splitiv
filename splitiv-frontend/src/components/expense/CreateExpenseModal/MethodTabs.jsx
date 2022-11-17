import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import EqualTab from "./EqualTab";
import UnequalTab from "./UnequalTab";

function MethodTabs() {
  const { watch, setValue } = useFormContext();

  const methodWatch = watch("method");

  const handleTabSwitch = (index) => {
    switch (index) {
      case 0: {
        return setValue("method", "equal");
      }
      case 1: {
        return setValue("method", "unequal");
      }
      default: {
        return setValue("method", "equal");
      }
    }
  };

  useEffect(() => {
    setValue("method", "equal");
  }, []);

  return (
    <Box w="full">
      <Tabs defaultIndex={0} onChange={handleTabSwitch}>
        <TabList>
          <Tab>Równo</Tab>
          <Tab>Nierówno</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>{methodWatch === "equal" && <EqualTab />}</TabPanel>
          <TabPanel px={0}>
            {methodWatch === "unequal" && <UnequalTab />}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default MethodTabs;
