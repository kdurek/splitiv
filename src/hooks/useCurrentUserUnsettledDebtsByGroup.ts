import { api } from "utils/api";

interface UseCurrentUserUnsettledDebtsByGroupProps {
  groupId: string;
}

function useCurrentUserUnsettledDebtsByGroup({
  groupId,
}: UseCurrentUserUnsettledDebtsByGroupProps) {
  return api.user.getCurrentUserUnsettledDebtsByGroup.useQuery({ groupId });
}

export { useCurrentUserUnsettledDebtsByGroup };
