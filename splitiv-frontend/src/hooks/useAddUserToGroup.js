import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function useAddUserToGroup(groupId) {
  const queryClient = useQueryClient();

  async function addUserToGroup(newUser) {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/groups/${groupId}/users`,
      newUser
    );
    return res.data;
  }

  return useMutation((values) => addUserToGroup(values), {
    onSuccess: () => {
      return queryClient.invalidateQueries(["groups", groupId]);
    },
  });
}

export { useAddUserToGroup };
