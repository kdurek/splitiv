import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import {
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerPopup,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerViewport,
} from "@repo/ui/components/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2Icon, UsersIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  createGroupMutationOptions,
  setActiveGroupMutationOptions,
} from "~/server/groups/mutations";
import { groupsQueryOptions } from "~/server/groups/queries";

export const Route = createFileRoute("/_auth/group/select")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: SelectGroupPage,
});

function CreateGroupDrawer() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createGroupMutation = useMutation({
    ...createGroupMutationOptions(),
    onSuccess: async (data) => {
      queryClient.setQueryData(authQueryOptions().queryKey, (old) =>
        old ? { ...old, activeOrganizationId: data.id } : old,
      );
      await queryClient.invalidateQueries();
      navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error("Nie udało się utworzyć grupy", { description: error.message });
    },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    createGroupMutation.mutate(name.trim());
  };

  return (
    <DrawerRoot open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="w-full">
        Utwórz grupę
      </Button>
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            <DrawerContent className="mx-auto w-full max-w-lg">
              <DrawerTitle className="mb-4 text-lg font-semibold tracking-tight">
                Utwórz nową grupę
              </DrawerTitle>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Nazwa grupy</Label>
                  <Input
                    id="group-name"
                    placeholder="np. Mieszkanie, Wyjazd, Rodzina"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!name.trim() || createGroupMutation.isPending}
                  >
                    {createGroupMutation.isPending ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Tworzenie...
                      </>
                    ) : (
                      "Utwórz"
                    )}
                  </Button>
                  <DrawerClose
                    render={
                      <Button type="button" variant="outline" className="w-full">
                        Anuluj
                      </Button>
                    }
                  />
                </div>
              </form>
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}

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
        <Empty className="max-w-sm border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Brak grup</EmptyTitle>
            <EmptyDescription>
              Nie należysz jeszcze do żadnej grupy. Utwórz własną lub poczekaj na zaproszenie.
            </EmptyDescription>
          </EmptyHeader>
          <CreateGroupDrawer />
        </Empty>
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
          <CreateGroupDrawer />
        </div>
      )}
    </div>
  );
}
