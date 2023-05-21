import { LoadingOverlay, Stack } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { createContext, useContext } from "react";

import { LoginPlaceholder } from "features/auth";
import { api } from "utils/api";

import { CreateGroupModal } from "./components/create-group-modal";
import { GroupSelectModal } from "./components/group-select-modal";

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

export function ActiveGroupProvider({ children }: ActiveGroupProviderProps) {
  const { status } = useSession();
  const [activeGroupId, , removeActiveGroupId] = useLocalStorage({
    key: "activeGroupId",
  });

  const groupQuery = api.group.getById.useQuery(
    {
      groupId: activeGroupId,
    },
    {
      enabled: status === "authenticated" && Boolean(activeGroupId),
      onError() {
        removeActiveGroupId();
      },
    }
  );

  if (status === "loading") {
    return <LoadingOverlay visible overlayOpacity={0} />;
  }

  if (status === "unauthenticated") {
    return <LoginPlaceholder />;
  }

  if (
    status === "authenticated" &&
    activeGroupId &&
    (groupQuery.isLoading || groupQuery.isError)
  ) {
    return <LoadingOverlay visible overlayOpacity={0} />;
  }

  if (status === "authenticated" && !activeGroupId) {
    return (
      <Stack p="md">
        <GroupSelectModal />
        <CreateGroupModal />
      </Stack>
    );
  }

  return (
    <ActiveGroupContext.Provider value={groupQuery.data}>
      {children}
    </ActiveGroupContext.Provider>
  );
}

// clhxtxlz90000y8xawcvocxpt
