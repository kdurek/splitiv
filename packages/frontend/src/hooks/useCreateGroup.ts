import { trpc } from "utils/trpc";

function useCreateGroup() {
  const utils = trpc.useContext();

  return trpc.group.createGroup.useMutation({
    onSuccess() {
      utils.group.getGroupsByMe.invalidate();
    },
  });
}

export { useCreateGroup };
