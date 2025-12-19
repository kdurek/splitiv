import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orpc, queryClient } from "@/utils/orpc";

export function GroupSwitcher() {
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

  const GROUPS =
    groupsQuery.data?.map((group) => ({
      label: group.name,
      value: group.id,
    })) ?? [];

  return (
    <Select
      disabled={getCurrentUserQuery.isPending}
      items={GROUPS}
      onValueChange={(value) =>
        value && changeActiveGroupMutation.mutate({ groupId: value })
      }
      value={getCurrentUserQuery.data?.activeGroupId ?? ""}
    >
      <SelectTrigger className="w-full">
        <SelectValue data-placeholder="Wybierz grupę" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {GROUPS.map((group) => (
            <SelectItem key={group.value} value={group.value}>
              {group.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
