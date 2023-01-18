import { trpc } from "utils/trpc";

function useUser(sub: string | undefined) {
  return trpc.user.getUser.useQuery(
    { sub },
    {
      enabled: Boolean(sub),
    }
  );
}

export { useUser };
