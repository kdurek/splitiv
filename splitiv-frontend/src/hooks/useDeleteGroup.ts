import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function deleteGroup(groupId: string) {
  const res = await axios.delete(
    `${import.meta.env.VITE_API_URL}/groups/${groupId}`
  );
  return res.data;
}

function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation(deleteGroup, {
    onSuccess: () => {
      return queryClient.invalidateQueries(["groups"]);
    },
  });
}

export { useDeleteGroup };
