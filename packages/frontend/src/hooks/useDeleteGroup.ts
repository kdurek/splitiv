import { trpc } from "utils/trpc";

function useDeleteGroup() {
  const utils = trpc.useContext();

  return trpc.group.deleteGroupById.useMutation({
    onSuccess() {
      utils.group.getGroupsByMe.invalidate();
    },
  });
}

export { useDeleteGroup };
