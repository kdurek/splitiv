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
import { UserAvatar } from "~/components/user-avatar";
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
    <div className="flex flex-col gap-8 p-4 pt-6">
      {/* Active group */}
      <section className="space-y-3">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Aktywna grupa
        </p>
        <div className="rounded-xl border-l-4 border-primary/40 bg-card p-5">
          {userGroups.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" className="w-full justify-between" />}
              >
                <span>{currentGroup?.name ?? "Wybierz grupę"}</span>
                <ChevronDownIcon className="size-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {userGroups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    disabled={switchGroupMutation.isPending}
                    onClick={() => {
                      if (group.id !== currentGroup?.id) switchGroupMutation.mutate(group.id);
                    }}
                  >
                    {group.name}
                    {group.id === currentGroup?.id && <CheckIcon className="ml-auto size-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <p className="text-sm text-muted-foreground">Nie należysz do żadnej grupy.</p>
          )}
        </div>
      </section>

      {/* Group members — admin only */}
      {currentGroup && isAdmin && (
        <section className="space-y-3">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Członkowie grupy
          </p>
          <div className="space-y-2">
            {currentGroupMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
              >
                <UserAvatar name={member.name} image={member.image} size="md" shape="square" />
                <span className="text-sm font-medium">{member.name}</span>
              </div>
            ))}

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
      <section className="space-y-3">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Konto
        </p>
        <div className="space-y-4 rounded-xl border-l-4 border-destructive/40 bg-card p-5">
          <div className="flex items-center gap-3">
            {currentUser?.name && (
              <UserAvatar
                name={currentUser.name}
                image={currentUser.image}
                size="lg"
                shape="square"
              />
            )}
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">{currentUser?.name}</span>
              <span className="text-xs text-muted-foreground">{currentUser?.email}</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
