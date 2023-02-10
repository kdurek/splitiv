import { useLocalStorage } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { createContext, useContext } from "react";

import GroupSelectModal from "components/GroupSelectModal";
import { api } from "utils/api";

import type { ReactNode } from "react";

export const ActiveGroupContext = createContext<{
  activeGroupId: string;
  setActiveGroupId: (value: string | ((val: string) => string)) => void;
}>({ activeGroupId: "", setActiveGroupId: () => null });

const useProvideActiveGroup = () => {
  const [activeGroupId, setActiveGroupId, removeActiveGroupId] =
    useLocalStorage({
      key: "activeGroupId",
      defaultValue: "",
    });

  api.group.getGroupById.useQuery(
    {
      groupId: activeGroupId,
    },
    {
      enabled: Boolean(activeGroupId),
      onError() {
        removeActiveGroupId();
      },
    }
  );

  return { activeGroupId, setActiveGroupId };
};

interface ActiveGroupProviderProps {
  children: ReactNode;
}

export function ActiveGroupProvider({ children }: ActiveGroupProviderProps) {
  const activeGroupContext = useProvideActiveGroup();
  const { activeGroupId, setActiveGroupId } = activeGroupContext;
  const { status } = useSession();

  if (status === "authenticated" && !activeGroupId) {
    return (
      <GroupSelectModal
        defaultIsOpen
        onSubmit={(values) => setActiveGroupId(values.group)}
      />
    );
  }

  return (
    <ActiveGroupContext.Provider value={activeGroupContext}>
      {children}
    </ActiveGroupContext.Provider>
  );
}

export const useActiveGroup = () => {
  const activeGroupContext = useContext(ActiveGroupContext);

  if (!activeGroupContext) {
    throw new Error(
      "useActiveGroup has to be used within <ActiveGroupProvider>"
    );
  }

  return activeGroupContext;
};
