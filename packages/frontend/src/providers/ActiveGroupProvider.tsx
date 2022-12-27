import { ReactNode, createContext, useContext } from "react";

import GroupSelectModal from "components/GroupSelect/GroupSelectModal";
import { useLocalStorage } from "hooks/useLocalStorage";

export const activeGroupContext = createContext<{
  activeGroupId: string;
  setActiveGroupId: (value: string | ((val: string) => string)) => void;
}>({ activeGroupId: "", setActiveGroupId: () => {} });

const useProvideActiveGroup = () => {
  const [activeGroupId, setActiveGroupId] = useLocalStorage<string>(
    "activeGroupId",
    ""
  );

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
