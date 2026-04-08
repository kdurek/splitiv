import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { SignOutButton } from "~/components/sign-out-button";
import {
  addUserToActiveGroupMutationOptions,
  setActiveGroupMutationOptions,
} from "~/server/groups/mutations";
import { groupsQueryOptions } from "~/server/groups/queries";

export const Route = createFileRoute("/_auth/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    data: { currentUser, currentGroup, currentGroupMembers, usersNotInGroup, userGroups },
  } = useSuspenseQuery(groupsQueryOptions());
  const queryClient = useQueryClient();

  const isAdmin = currentUser?.id === currentGroup?.adminId;

  const switchGroupMutation = useMutation({
    ...setActiveGroupMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Zmieniono aktywną grupę");
    },
    onError: (error) => {
      toast.error("Nie udało się zmienić grupy", { description: error.message });
    },
  });

  const addUserMutation = useMutation({
    ...addUserToActiveGroupMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Pomyślnie dodano użytkownika do grupy");
    },
    onError: (error) => {
      toast.error("Nie udało się dodać użytkownika", { description: error.message });
    },
  });

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Active group */}
      <section className="rounded-2xl border bg-card p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Aktywna grupa
        </p>
        {userGroups.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" className="w-full justify-between" />}
            >
              <span>{currentGroup?.name ?? "Wybierz grupę"}</span>
              <ChevronDownIcon className="size-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {userGroups.map((g) => (
                <DropdownMenuItem
                  key={g.id}
                  disabled={switchGroupMutation.isPending}
                  onClick={() => {
                    if (g.id !== currentGroup?.id) switchGroupMutation.mutate(g.id);
                  }}
                >
                  {g.name}
                  {g.id === currentGroup?.id && <CheckIcon className="ml-auto size-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="text-sm text-muted-foreground">Nie należysz do żadnej grupy.</p>
        )}
      </section>

      {/* Group members — admin only */}
      {currentGroup && isAdmin && (
        <section className="rounded-2xl border bg-card p-4">
          <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Członkowie grupy
          </p>
          <div className="grid gap-3">
            <ol className="grid gap-1.5">
              {currentGroupMembers.map((member) => (
                <li key={member.userId} className="flex items-center gap-2 text-sm">
                  <div className="size-1.5 rounded-full bg-foreground/40" />
                  {member.name}
                </li>
              ))}
            </ol>

            {usersNotInGroup.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      disabled={addUserMutation.isPending}
                    />
                  }
                >
                  <PlusIcon className="size-4" />
                  Dodaj użytkownika
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {usersNotInGroup.map((u) => (
                    <DropdownMenuItem
                      key={u.id}
                      onClick={() =>
                        addUserMutation.mutate({ groupId: currentGroup.id, userId: u.id })
                      }
                    >
                      {u.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </section>
      )}

      {/* Account */}
      <section className="rounded-2xl border bg-card p-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Konto
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{currentUser?.name}</span>
            <span className="text-xs text-muted-foreground">{currentUser?.email}</span>
          </div>
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
