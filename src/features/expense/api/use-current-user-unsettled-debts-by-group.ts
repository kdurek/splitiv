import { useActiveGroup } from "features/group";
import { api } from "utils/api";

export function useCurrentUserUnsettledDebtsByGroup() {
  const { id: groupId } = useActiveGroup();

  return api.user.getCurrentUserUnsettledDebtsByGroup.useQuery({ groupId });
}
