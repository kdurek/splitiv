import { useLocalStorage } from "@mantine/hooks";
import { ReactNode, createContext, useContext } from "react";

import GroupSelectModal from "components/GroupSelectModal";

export const activeGroupContext = createContext<{
  activeGroupId: string;
  setActiveGroupId: (value: string | ((val: string) => string)) => void;
}>({ activeGroupId: "", setActiveGroupId: () => null });

const useProvideActiveGroup = () => {
  const [activeGroupId, setActiveGroupId] = useLocalStorage<string>({
    key: "activeGroupId",
    defaultValue: "",
  });

  return { activeGroupId, setActiveGroupId };
};

interface ActiveGroupProviderProps {
  children: ReactNode;
}

export function ActiveGroupProvider({ children }: ActiveGroupProviderProps) {
  const group = useProvideActiveGroup();
  const { activeGroupId, setActiveGroupId } = group;

  if (!activeGroupId) {
    return (
      <GroupSelectModal
        defaultIsOpen
        onSubmit={(values) => setActiveGroupId(values.group)}
      />
    );
  }

  return (
    <activeGroupContext.Provider value={group}>
      {children}
    </activeGroupContext.Provider>
  );
}

export const useActiveGroup = () => {
  return useContext(activeGroupContext);
};
