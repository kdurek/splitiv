import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface NewUser {
  userId: string;
}

function useAddUserToGroup(groupId: string | undefined) {
  const queryClient = useQueryClient();

  async function addUserToGroup(newUser: NewUser) {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/groups/${groupId}/users`,
      newUser
    );
    return res.data;
  }

  return useMutation((values: NewUser) => addUserToGroup(values), {
    onSuccess: () => {
      return queryClient.invalidateQueries(["groups", groupId]);
    },
  });
}

export { useAddUserToGroup };
