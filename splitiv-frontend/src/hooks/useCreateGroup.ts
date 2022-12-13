import { trpc } from "utils/trpc";

function useCreateGroup() {
  const utils = trpc.useContext();

  return trpc.groups.createGroup.useMutation({
    onSuccess() {
      utils.groups.getGroupsByMe.invalidate();
    },
  });
}

export { useCreateGroup };
