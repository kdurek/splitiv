import { useLocalStorage } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { createContext, useContext } from "react";

import { api } from "utils/api";

import { GroupSelectModal } from "./components/group-select-modal";

import type { User } from "next-auth";
import type { ReactNode } from "react";
import type { GetGroupById } from "utils/api";

interface ActiveGroupProviderProps {
  children: ReactNode;
}

const ActiveGroupContext = createContext<GetGroupById | undefined>(undefined);

export const useActiveGroup = (): GetGroupById => {
  const data = useContext(ActiveGroupContext);

  if (!data) {
    throw new Error("Active group is being read outside ActiveGroupProvider");
  }

  return data;
};

const isUserInGroup = (user: User, group: GetGroupById) => {
  return group.members.map((m) => m.id).includes(user.id);
};

export function ActiveGroupProvider({ children }: ActiveGroupProviderProps) {
  const { data: session, status } = useSession();
  const [activeGroupId, setActiveGroupId, removeActiveGroupId] =
    useLocalStorage({
      key: "activeGroupId",
    });

  const groupQuery = api.group.getById.useQuery(
    {
      groupId: activeGroupId,
    },
    {
      enabled: status === "authenticated" && Boolean(activeGroupId),
      onSuccess(group) {
        if (
          status === "authenticated" &&
          (!isUserInGroup(session.user, group) || group.id !== activeGroupId)
        ) {
          removeActiveGroupId();
        }
      },
      onError() {
        removeActiveGroupId();
      },
    }
  );

  if (status === "authenticated" && !activeGroupId) {
    return (
      <GroupSelectModal
        defaultIsOpen
        onSubmit={(values) => setActiveGroupId(values.group)}
      />
    );
  }

  if (
    status === "authenticated" &&
    (groupQuery.isLoading || groupQuery.isError)
  ) {
    return null;
  }

  if (
    status === "authenticated" &&
    groupQuery.data &&
    (!isUserInGroup(session.user, groupQuery.data) ||
      groupQuery.data.id !== activeGroupId)
  ) {
    return null;
  }

  return (
    <ActiveGroupContext.Provider value={groupQuery.data}>
      {children}
    </ActiveGroupContext.Provider>
  );
}
