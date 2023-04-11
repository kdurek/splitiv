import { api } from "utils/api";

interface UseCurrentUserUnsettledDebtsByGroupProps {
  groupId: string;
}

export function useCurrentUserUnsettledDebtsByGroup({
  groupId,
}: UseCurrentUserUnsettledDebtsByGroupProps) {
  return api.user.getCurrentUserUnsettledDebtsByGroup.useQuery({ groupId });
}
