import { useLocalStorage } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { createContext, useContext } from "react";

import GroupSelectModal from "components/GroupSelectModal";
import { api } from "utils/api";

import type { ReactNode } from "react";
import type { GetGroupById } from "utils/api";

export const activeGroupContext = createContext<{
  group?: GetGroupById;
  activeGroupId: string;
  setActiveGroupId: (value: string | ((val: string) => string)) => void;
}>({ activeGroupId: "", setActiveGroupId: () => null });

const useProvideActiveGroup = () => {
  const [activeGroupId, setActiveGroupId, removeActiveGroupId] =
    useLocalStorage({
      key: "activeGroupId",
    });

  const { data: group } = api.group.getGroupById.useQuery(
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

  return { activeGroup: group, activeGroupId, setActiveGroupId };
};

interface ActiveGroupProviderProps {
  children: ReactNode;
}

export function ActiveGroupProvider({ children }: ActiveGroupProviderProps) {
  const group = useProvideActiveGroup();
  const { activeGroupId, setActiveGroupId } = group;
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
    <activeGroupContext.Provider value={group}>
      {children}
    </activeGroupContext.Provider>
  );
}

export const useActiveGroup = () => {
  return useContext(activeGroupContext);
};
