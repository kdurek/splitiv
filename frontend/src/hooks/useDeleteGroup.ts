import { trpc } from "utils/trpc";

function useDeleteGroup() {
  const utils = trpc.useContext();

  return trpc.groups.deleteGroupById.useMutation({
    onSuccess() {
      utils.groups.getGroupsByMe.invalidate();
    },
  });
}

export { useDeleteGroup };
