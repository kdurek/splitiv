import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import EqualTab from "components/expense/CreateExpenseModal/EqualTab";
import RatioTab from "components/expense/CreateExpenseModal/RatioTab";
import UnequalTab from "components/expense/CreateExpenseModal/UnequalTab";

function MethodTabs() {
  const { watch, setValue } = useFormContext();

  const methodWatch = watch("method");

  const handleTabSwitch = (index: number) => {
    switch (index) {
      case 0: {
        return setValue("method", "equal");
      }
      case 1: {
        return setValue("method", "unequal");
      }
      case 2: {
        return setValue("method", "ratio");
      }
      default: {
        return setValue("method", "equal");
      }
    }
  };

  useEffect(() => {
    setValue("method", "equal");
  }, [setValue]);

  return (
    <Box w="full">
      <Tabs defaultIndex={0} onChange={handleTabSwitch}>
        <TabList>
          <Tab>Równo</Tab>
          <Tab>Nierówno</Tab>
          <Tab>Współczynnik</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>{methodWatch === "equal" && <EqualTab />}</TabPanel>
          <TabPanel px={0}>
            {methodWatch === "unequal" && <UnequalTab />}
          </TabPanel>
          <TabPanel px={0}>{methodWatch === "ratio" && <RatioTab />}</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default MethodTabs;
