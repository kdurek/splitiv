import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { setActiveGroupMutationOptions } from "~/server/groups/mutations";
import { groupsQueryOptions } from "~/server/groups/queries";

export const Route = createFileRoute("/_auth/group/select")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: SelectGroupPage,
});

function SelectGroupPage() {
  const { data } = useSuspenseQuery(groupsQueryOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const switchGroupMutation = useMutation({
    ...setActiveGroupMutationOptions(),
    onSuccess: (_, groupId) => {
      queryClient.setQueryData(authQueryOptions().queryKey, (old) =>
        old ? { ...old, activeOrganizationId: groupId } : old,
      );
      queryClient.invalidateQueries();
      navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error("Nie udało się wybrać grupy", { description: error.message });
    },
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Wybierz grupę</h1>
        <p className="text-sm text-muted-foreground">
          Wybierz grupę, aby kontynuować korzystanie z aplikacji.
        </p>
      </div>

      {data.userGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nie należysz do żadnej grupy.</p>
      ) : (
        <div className="w-full max-w-sm space-y-2">
          {data.userGroups.map((group) => (
            <Button
              key={group.id}
              variant="outline"
              className="w-full"
              disabled={switchGroupMutation.isPending}
              onClick={() => switchGroupMutation.mutate(group.id)}
            >
              {group.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
