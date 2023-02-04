import { trpc } from "utils/trpc";

function useCreateGroup() {
  const utils = trpc.useContext();

  return trpc.group.createGroup.useMutation({
    async onSuccess() {
      await utils.group.getGroupsByMe.invalidate();
    },
  });
}

export { useCreateGroup };
