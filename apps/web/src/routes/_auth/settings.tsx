import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { SignOutButton } from "~/components/sign-out-button";
import { UserAvatar } from "~/components/user-avatar";
import {
  addMemberByEmailMutationOptions,
  setActiveGroupMutationOptions,
} from "~/server/groups/mutations";
import { groupsQueryOptions } from "~/server/groups/queries";

export const Route = createFileRoute("/_auth/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    data: { currentUser, currentGroup, currentGroupMembers, userGroups, isOwner },
  } = useSuspenseQuery(groupsQueryOptions());
  const queryClient = useQueryClient();
  const [email, setEmail] = React.useState("");

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

  const addMemberMutation = useMutation({
    ...addMemberByEmailMutationOptions(),
    onSuccess: async () => {
      setEmail("");
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Pomyślnie dodano użytkownika do grupy");
    },
    onError: (error) => {
      toast.error("Nie udało się dodać użytkownika", { description: error.message });
    },
  });

  const handleAddMember = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email.trim()) return;
    addMemberMutation.mutate(email.trim());
  };

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

      {/* Group members — owner only */}
      {currentGroup && isOwner && (
        <section className="space-y-3">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Członkowie grupy
          </p>
          <div className="space-y-2">
            {currentGroupMembers.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
              >
                <UserAvatar name={m.name} image={m.image} size="md" shape="square" />
                <span className="text-sm font-medium">{m.name}</span>
              </div>
            ))}

            <form onSubmit={handleAddMember} className="flex gap-2 pt-1">
              <Input
                type="email"
                placeholder="Adres email użytkownika"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={addMemberMutation.isPending}
              />
              <Button
                type="submit"
                variant="outline"
                size="icon"
                disabled={addMemberMutation.isPending || !email.trim()}
              >
                <PlusIcon className="size-4" />
              </Button>
            </form>
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
