import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { NotificationPlayground } from "@/components/notification-playground";
import { PageLoader } from "@/components/page-loader";
import { SelectGroup } from "@/components/select-group";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/_app/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const currentUserQuery = useQuery(orpc.auth.getCurrentUser.queryOptions());
  const currentGroupQuery = useQuery(orpc.group.current.queryOptions());
  const usersNotInCurrentGroupQuery = useQuery(
    orpc.auth.listNotInCurrentGroup.queryOptions()
  );
  const addUserToGroupMutation = useMutation(
    orpc.group.addUser.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries();
        toast.success("Pomyślnie dodano użytkownika do grupy");
      },
      onError(error) {
        toast.error("Nie udało się dodać użytkownika do grupy", {
          description: error.message,
        });
      },
    })
  );

  if (currentGroupQuery.isPending) {
    return <PageLoader />;
  }

  if (!currentGroupQuery.data) {
    return <div>Nie udało się załadować grupy</div>;
  }

  const isAdmin = currentUserQuery.data?.id === currentGroupQuery.data.adminId;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aktywna grupa</CardTitle>
        </CardHeader>
        <CardContent>
          <SelectGroup />
        </CardContent>
      </Card>
      {isAdmin && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Członkowie grupy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <ol className="grid gap-1">
                {currentGroupQuery.data.members.map((member) => (
                  <li className="flex items-center gap-2" key={member.user.id}>
                    <div className="size-1 rounded-full bg-black" />{" "}
                    {member.user.name}
                  </li>
                ))}
              </ol>
              {usersNotInCurrentGroupQuery.data &&
                usersNotInCurrentGroupQuery.data.length > 0 && (
                  <Select
                    onValueChange={(value) =>
                      addUserToGroupMutation.mutate({ userId: value })
                    }
                    value=""
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Dodaj użytkownika" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {usersNotInCurrentGroupQuery.data?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
            </div>
          </CardContent>
        </Card>
      )}
      {isAdmin && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Notification playground</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationPlayground />
          </CardContent>
        </Card>
      )}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Konto</CardTitle>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </>
  );
}
