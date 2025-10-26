import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orpc, queryClient } from "@/utils/orpc";

export function SelectGroup() {
  const getCurrentUserQuery = useQuery(orpc.auth.getCurrentUser.queryOptions());
  const groupsQuery = useQuery(orpc.group.list.queryOptions());
  const changeActiveGroupMutation = useMutation(
    orpc.group.changeCurrent.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries();
        toast.success("Pomyślnie zmieniono grupę");
      },
      onError(error) {
        toast.error("Nie udało się zmienić grupy", {
          description: error.message,
        });
      },
    })
  );

  return (
    <Select
      disabled={getCurrentUserQuery.isPending}
      onValueChange={(value) =>
        changeActiveGroupMutation.mutate({ groupId: value })
      }
      value={getCurrentUserQuery.data?.activeGroupId ?? ""}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Wybierz grupę" />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        {groupsQuery.data?.map((group) => (
          <SelectItem key={group.id} value={group.id}>
            {group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
