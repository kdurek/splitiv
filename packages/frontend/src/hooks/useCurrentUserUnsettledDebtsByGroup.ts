import { trpc } from "utils/trpc";

interface UseCurrentUserUnsettledDebtsByGroupProps {
  groupId: string;
}

function useCurrentUserUnsettledDebtsByGroup({
  groupId,
}: UseCurrentUserUnsettledDebtsByGroupProps) {
  return trpc.user.getCurrentUserUnsettledDebtsByGroup.useQuery({ groupId });
}

export { useCurrentUserUnsettledDebtsByGroup };
